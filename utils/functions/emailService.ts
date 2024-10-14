import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const transport = nodemailer.createTransport({
    service: 'gmail',   
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure : process.env.NODE_ENV !== 'development', // true 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
} as SMTPTransport.Options );

type Attachment = {
    filename: string;
    content: Buffer // Content of the attachment (Base64 or Buffer)
    contentType: string // MIME type of the attachment (e.g., 'application/pdf', 'image/jpeg')
}

export const sendEmail = async (to: string, subject: string, html: string, attachments: Attachment[]) => {
    try {
        const info = await transport.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
            attachments,
        });
        console.log("Message sent: %s", info.messageId);
        return info; // Return the info object if needed
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email: " + (error as Error).message);
    }
};