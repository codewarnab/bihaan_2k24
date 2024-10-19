import { Instagram } from 'lucide-react'
import React from 'react'

type EmailData = {
    name: string
    roll: string
    email: string
    phone: string
    veg_nonveg: string
    dept: string
    id: string
    isVolunteer: boolean
    tshirt_size?: string
    qrCodeUrl: string
}

export default function EmailTemplate({ emailData }: { emailData: EmailData }) {
    return (
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif',
            color: 'white',
            textAlign: 'center',
            backgroundImage: "url('https://ylhfltcmljebclbhdyuy.supabase.co/storage/v1/object/public/images/WhatsApp%20Image%202024-10-16%20at%2016.56.47_25319494%201.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '20px',
            position: 'relative',
        }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
                <h1 style={{
                    fontSize: 'clamp(24px, 5vw, 48px)',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    color: '#FFD700',
                    lineHeight: 'clamp(1.2, 1.5vw, 1.5)',
                }}>
                    See you there!
                </h1>

                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#FF6B6B' }}>{emailData.name}</h2>
                    <p style={{ fontSize: '18px', marginBottom: '10px' }}>Roll Number: <span style={{ color: '#4ECDC4', fontWeight: 'bold' }}>{emailData.roll}</span></p>
                    <p style={{ fontSize: '18px', marginBottom: '10px' }}>Department: <span style={{ color: '#4ECDC4', fontWeight: 'bold' }}>{emailData.dept}</span></p>
                    {emailData.tshirt_size && (
                        <p style={{ fontSize: '18px', marginBottom: '10px' }}>T-Shirt Size: <span style={{ color: '#4ECDC4', fontWeight: 'bold' }}>{emailData.tshirt_size}</span></p>
                    )}
                    <p style={{ fontSize: '18px', marginBottom: '10px' }}>Food Preference: <span style={{ color: '#4ECDC4', fontWeight: 'bold' }}>{emailData.veg_nonveg}</span></p>
                    <p style={{ fontSize: '18px', marginBottom: '10px' }}><strong style={{ color: '#FFD700', fontWeight: 'bold' }}>Dates:</strong> <span style={{ color: '#FFD700' }}>October 25-27, 2024</span></p>
                    <p style={{ fontSize: '18px', marginBottom: '12px' }}><strong style={{ color: '#FFD700', fontWeight: 'bold' }}>Venue:</strong> <span style={{ color: '#FFD700' }}>RCCIIT College New Campus Building</span></p>
                    <p style={{ color: 'red', fontWeight: 'bold', fontSize: '12px' }}>Please find your QR code attached to this email.</p>
                    <p style={{ color: 'red', fontWeight: 'bold', marginTop: '5px' }}>The QR code attachment is mandatory for entry.</p>
                </div>

               

                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#FF6B6B' }}>Instructions</h3>
                    <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                        <li>QR code is <span style={{ color: '#FFD700', fontWeight: 'bold' }}>mandatory</span> for entry</li>
                        <li>Follow the dress code</li>
                    </ul>
                </div>


                <div style={{ marginBottom: '20px' }}>
                    <a href="https://www.instagram.com/bihaan_rcciit/" style={{
                        color: '#4ECDC4',
                        display: 'inline-flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        fontSize: '16px',
                       
                    }}>
                        <img
                            src="https://cdn2.iconfinder.com/data/icons/social-media-2285/512/1_Instagram_colored_svg_1-512.png"
                            alt="Instagram"
                            style={{ width: '24px', height: '24px', marginRight: '8px' }}
                        />
                        Follow us on Instagram
                    </a>
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#FFD700' }}>RCC Institute of Information Technology</h1>

                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '14px',
                }}>
                    <h3 style={{ fontSize: '24px', margin: '10px 0', color: '#FF6B6B' }}>BIHAAN 2024-25</h3>
                    <p style={{ color: '#4ECDC4' }}>#Discover_Connect_Vibe</p>
                </div>
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    marginTop: '20px',
                }}>
                    <p style={{ margin: '5px 0', color: '#FFFFFF' }}>For any Queries reach out to:</p>
                    <p style={{ margin: '5px 0', color: '#FFFFFF' }}>Basant Kumar Das (GS) - 7547927975</p>
                    <p style={{ margin: '5px 0', color: '#FFFFFF' }}>MANISH BISWAS (Cultural AGS) - 9062312650</p>
                    <p style={{ margin: '5px 0', color: '#FFFFFF' }}>Ankita Dhara (Tech AGS) - 8820534958</p>
                    <p style={{ margin: '5px 0', color: '#FFFFFF' }}>Subhranil Saha (Sports AGS) - 8101696445</p>
                </div>
            </div>
        </div>
    )
}