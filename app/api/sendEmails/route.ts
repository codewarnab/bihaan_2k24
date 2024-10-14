import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/utils/functions/emailService";
import { StudentData } from "@/lib/types/student";
import QRCode from 'qrcode';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
    const { id } = await req.json();

    console.log("Received request to send email for student ID:", id);

    if (!id) {
        console.error("Student ID is required.");
        return NextResponse.json({ error: "Student ID is required." }, { status: 400 });
    }

    try {
        console.log("Updating student status to 'sending' for ID:", id);
        await supabase
            .from("people")
            .update({ status: "sending" })
            .eq("id", id);

        const { data: student, error } = await supabase
            .from("people")
            .select(`
                email,
                name,
                phone,
                college_roll,
                veg_nonveg,
                tshirt_size,
                id,
                dept
            `)
            .eq("id", id)
            .single() as { data: StudentData, error: any };

        if (error || !student) {
            console.error("Student not found or error fetching data:", error);
            return NextResponse.json({ error: "Student not found." }, { status: 404 });
        }

        console.log("Fetched student data:", student);

        // Create a JWT token with student data
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables.");
            throw new Error("JWT_SECRET is not defined in environment variables.");
        }
        const token = jwt.sign(student, process.env.JWT_SECRET, { expiresIn: '3d' });
        console.log("Generated JWT token for student:", student.college_roll);

        await supabase.from("people").update({ token: token }).eq("id", id);
        // Generate a QR code
        const qrData = {
            name: student.name,
            roll: student.college_roll,
            email: student.email,
            phone: student.phone,
            veg_nonveg: student.veg_nonveg,
            tshirt_size: student.tshirt_size,
            dept: student.dept,
            id: student.id,
            jwtToken: token,
        };

        // Generate a QR code with the prepared data
        const qrCodeData = await QRCode.toDataURL(JSON.stringify(qrData));
        console.log("Generated QR code data for student:", student.college_roll);

        // Upload the QR code to Supabase storage
        const {  error: fileUploadError } = await supabase.storage
            .from('qr_codes') // Assuming 'qr_codes' is the Supabase bucket
            .upload(`qr_${student.id}.png`, Buffer.from(qrCodeData.split(',')[1], 'base64'), {
                contentType: 'image/png',
                upsert: true
            });

        if (fileUploadError) {
            console.error("Error uploading QR code:", fileUploadError);
            await supabase
                .from("people")
                .update({ status: "failed" , reasons: fileUploadError.message})
                .eq("id", id);
            console.log("Updated student status to 'failed' for ID:", id);
            return NextResponse.json({ error: "Failed to upload QR code." }, { status: 500 });
        }
        console.log("Uploaded QR code for student:", student.college_roll);

        // Get the public URL for the uploaded QR code
        const { data: publicUrlData } = supabase.storage
            .from('qr_codes')
            .getPublicUrl(`qr_${student.id}.png`)

        if (!publicUrlData) {
            console.error("Failed to retrieve public URL for QR code.");
            return NextResponse.json({ error: "Failed to retrieve public URL." }, { status: 500 });
        }

        const publicURL = publicUrlData.publicUrl;
        console.log("Public URL for QR code:", publicURL);

        const { data, error: updateError } = await supabase
            .from("people")
            .update({ qrcode: publicURL })
            .eq("id", id);
        console.log(data);
        if (updateError) {
            console.error("Error updating student data:", updateError);
            return NextResponse.json({ error: "Failed to update student data." }, { status: 500 });
        }
        // Send the email with the QR code attached 
        try {
            await sendEmail(student.email, "Your QR Code", `<p>Hello ${student.name},</p><p>Please find your QR code below:</p>`, [
                {
                    filename: `qr_${student.id}.png`,
                    content: Buffer.from(qrCodeData.split(',')[1], 'base64'),
                    contentType: 'image/png'
                }
            ]);
            console.log("Email sent to:", student.email);

            // Update the student record with the QR code URL
            
        } catch (error) {
            console.error("Error sending email:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            await supabase
                .from("people")
                .update({ status: "failed", reasons: errorMessage })
                .eq("id", id);
            console.log("Updated student status to 'failed' for ID:", id);
            return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
        }

        // Update the student's status in the database
        await supabase
            .from("people")
            .update({ status: "sent" })
            .eq("id", id);
        console.log("Updated student status to 'sent' for ID:", id);

        return NextResponse.json({ message: "Email sent successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Error fetching student data or sending email:", error);
        await supabase
            .from("people")
            .update({ status: "failed" })
            .eq("id", id);
        console.log("Updated student status to 'failed' for ID:", id);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
