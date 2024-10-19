import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import EmailTemplate from '@/components/EmailTemplate';
import { ReactElement } from 'react';

const transport = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT as unknown as number,
    secure: process.env.NODE_ENV !== 'development',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
} as SMTPTransport.Options);

type Attachment = {
    filename: string;
    content: Buffer;
    contentType: string;
}

type EmailData = {
    name: string;
    roll: string;
    email: string;
    phone: string;
    veg_nonveg: string;
    dept: string;
    id: string;
    isVolunteer: boolean;
    tshirt_size?: string;
    qrCodeUrl: string;
}

export const sendEmail = async (to: string, subject: string, emailData: EmailData, attachments: Attachment[]) => {
    const emailContent = EmailTemplate({ emailData });

    try {
        const info = await transport.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: await renderToHtml(emailContent),
            attachments,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email: " + (error as Error).message);
    }
};

async function renderToHtml(component: ReactElement): Promise<string> {
    const { renderToString } = await import('react-dom/server');
    return '<!DOCTYPE html>' + renderToString(component);
}