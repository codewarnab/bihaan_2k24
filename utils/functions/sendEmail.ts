import axios from 'axios';
import { toast } from "sonner"
import { IUser } from '@/lib/types/user'; 
import { supabase } from '@/lib/supabase-client';

const sendEmail = async (id: number, type: 'student' | 'volunteer', user: IUser | null) => {
    if (!user) {
        toast.error("You are not authorized to perform this action.");
        return;
    }
    const table = type === 'student' ? 'people' : 'volunteers';
    await supabase
        .from(table)
        .update({ status: "sending" })
        .eq("id", id);

    try {
        const response = await axios.post("/api/sendEmails", {
            id,
            type,
            userid: user.id
        });

        if (response.status === 403) {
            toast.error("You are not authorized to perform this action.");
            return;
        }

        if (response.status !== 200) {
            throw new Error("Failed to send email");
        }

        toast.success(`Email sent successfully!`);
        return response.data;

    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send email");
        console.error('Error sending email:', error);
    }
};

export default sendEmail;
