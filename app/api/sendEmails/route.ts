import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/utils/functions/emailService";
import { StudentData } from "@/lib/types/student";
import { VolunteerData } from "@/lib/types/volunteer";
import QRCode from 'qrcode';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
    const { id, type, userid } = await req.json();

    const { data: userdata } = await supabase
        .from('users')
        .select('isGod')
        .eq('id', userid);

    console.log("User data", userdata);

    if (userdata && !userdata[0]?.isGod) {
        return NextResponse.json({ error: "You are not authorized to perform this action." }, { status: 403 });
    }

    console.log(`Received request to send email for ${type} ID:`, id);

    if (!id || !type) {
        console.error("ID and type are required.");
        return NextResponse.json({ error: "ID and type are required." }, { status: 400 });
    }

    const table = type === 'student' ? 'people' : 'volunteers';
    const isVolunteer = type === 'volunteer';

    try {
        console.log(`Updating ${type} status to 'sending' for ID:`, id);
        await supabase
            .from(table)
            .update({ status: "sending" })
            .eq("id", id);

        const { data: person, error } = await supabase
            .from(table)
            .select(`
                email,
                name,
                phone,
                college_roll,
                veg_nonveg,
                ${type === 'student' ? 'tshirt_size,' : ''}
                ${isVolunteer ? 'team,' : ''}
                id,
                dept
            `)
            .eq("id", id)
            .single() as { data: StudentData | VolunteerData, error: any };

        if (error || !person) {
            console.error(`${type} not found or error fetching data:`, error);
            return NextResponse.json({ error: `${type} not found.` }, { status: 404 });
        }

        // Validate fields that must not be null
        if (!person.name || !person.college_roll || !person.email || !person.phone || !person.veg_nonveg || !person.dept || !person.id) {
            return NextResponse.json({ error: "One or more required fields are null." }, { status: 400 });
        }

        // Generate a QR code
        const qrData = {
            name: person.name,
            roll: person.college_roll,
            email: person.email,
            phone: person.phone,
            veg_nonveg: person.veg_nonveg,
            dept: person.dept,
            id: person.id,
            isVolunteer,
            ...(type === 'student' && { tshirt_size: (person as StudentData).tshirt_size }),
            ...(isVolunteer && { team: (person as VolunteerData).team }),
        };

        // Generate a QR code with the prepared data
        const qrCodeData = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 500,
            margin: 4,
        });

        console.log(`Generated QR code data for ${type}:`, person.college_roll);

        // Upload the QR code to Supabase storage
        const { error: fileUploadError } = await supabase.storage
            .from('qr_codes')
            .upload(`qr_${type}_${person.id}.png`, Buffer.from(qrCodeData.split(',')[1], 'base64'), {
                contentType: 'image/png',
                upsert: true
            });

        if (fileUploadError) {
            console.error("Error uploading QR code:", fileUploadError);
            await supabase
                .from(table)
                .update({ status: "failed", reason: fileUploadError.message })
                .eq("id", id);
            console.log(`Updated ${type} status to 'failed' for ID:`, id);
            return NextResponse.json({ error: "Failed to upload QR code." }, { status: 500 });
        }
        console.log(`Uploaded QR code for ${type}:`, person.college_roll);

        // Get the public URL for the uploaded QR code
        const { data: publicUrlData } = supabase.storage
            .from('qr_codes')
            .getPublicUrl(`qr_${type}_${person.id}.png`);

        if (!publicUrlData) {
            console.error("Failed to retrieve public URL for QR code.");
            return NextResponse.json({ error: "Failed to retrieve public URL." }, { status: 500 });
        }

        const publicURL = publicUrlData.publicUrl;
        console.log("Public URL for QR code:", publicURL);

        const { error: updateError } = await supabase
            .from(table)
            .update({ qrcode: publicURL })
            .eq("id", id);

        if (updateError) {
            console.error(`Error updating ${type} data:`, updateError);
            return NextResponse.json({ error: `Failed to update ${type} data.` }, { status: 500 });
        }

        // Send the email with the QR code attached 
        try {
            const emailSubject = type === 'student' ? `${person.name}  BIHAAN 2024-25 PASS Details ` : `${person.name} BIHAAN 2024-25 VOLUNTEER PASS Details`;
            const emailData = {
                name: person.name,
                roll: person.college_roll,
                email: person.email,
                veg_nonveg: person.veg_nonveg,
                dept: person.dept,
                isVolunteer,
                tshirt_size: type === 'student' ? (person as StudentData).tshirt_size : undefined,
                qrCodeUrl: publicURL,
                team: isVolunteer ? (person as VolunteerData).team : undefined
            };

            await sendEmail(person.email, emailSubject, emailData, [
                {
                    filename: `qr_${type}_${person.id}.png`,
                    content: Buffer.from(qrCodeData.split(',')[1], 'base64'),
                    contentType: 'image/png'
                }
            ]);
            console.log("Email sent to:", person.email);
        } catch (error) {
            console.error("Error sending email:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            await supabase
                .from(table)
                .update({ status: "failed", reason: errorMessage })
                .eq("id", id);
            console.log(`Updated ${type} status to 'failed' for ID:`, id);
            return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
        }

        // Update the person's status in the database
        await supabase
            .from(table)
            .update({ status: "sent" })
            .eq("id", id);
        console.log(`Updated ${type} status to 'sent' for ID:`, id);

        return NextResponse.json({ message: "Email sent successfully!" }, { status: 200 });
    } catch (error) {
        console.error(`Error fetching ${type} data or sending email:`, error);
        await supabase
            .from(table)
            .update({ status: "failed" })
            .eq("id", id);
        console.log(`Updated ${type} status to 'failed' for ID:`, id);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
