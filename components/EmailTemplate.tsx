import React from 'react';

type EmailData = {
    name: string
    roll: string
    email: string
    veg_nonveg: string
    dept: string
    isVolunteer: boolean
    tshirt_size?: string | null
    team?: string
    qrCodeUrl: string
}

export default function EmailTemplate({ emailData }: { emailData: EmailData }) {
    return (
        <div style={{
            fontFamily: "'Recoleta', 'Abhaya Libre', sans-serif",
            color: '#ffffff',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            background: 'linear-gradient(to bottom, #2a0e4a, #3b1259, #4d1668, #601b77, #742086, #8a2595, #a12aa4, #b92fb3, #c92bb5)',
            minHeight: '100vh',
            boxSizing: 'border-box',
            padding: '20px',
            textAlign: 'center',
        }}>
            <h1 style={{
                color: '#ff00ff',
                fontSize: 'clamp(24px, 5vw, 36px)',
                marginBottom: '20px'
            }}>SEE YOU THERE !</h1>

            <div style={{ marginBottom: '20px', color: '#ffffff' }}>
                <p style={{ margin: '5px 0', fontSize: 'clamp(18px, 4vw, 24px)' }}>{emailData.name}</p>
                {emailData.isVolunteer && emailData.team && (
                    <p style={{ margin: '5px 0', fontSize: 'clamp(16px, 3vw, 20px)' }}>{emailData.team}</p>
                )}
            </div>

            <div style={{
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: 'clamp(14px, 3vw, 18px)'
            }}>
                <p style={{ margin: '5px 0', color: '#a67bff' }}>Roll Number : <span style={{ color: '#ffffff' }}>{emailData.roll}</span></p>
                <p style={{ margin: '5px 0', color: '#a67bff' }}>Department : <span style={{ color: '#ffffff' }}>{emailData.dept}</span></p>
                <p style={{ margin: '5px 0', color: '#a67bff' }}>Food preference : <span style={{ color: '#ffffff' }}>{emailData.veg_nonveg}</span></p>
                {emailData.tshirt_size && (
                    <p style={{ margin: '5px 0', color: '#a67bff' }}>T-shirt Size : <span style={{ color: '#ffffff' }}>{emailData.tshirt_size}</span></p>
                )}
            </div>

            <div style={{
                marginBottom: '20px',
                color: '#ff00ff',
                fontSize: 'clamp(14px, 3vw, 18px)'
            }}>
                <p style={{ margin: '5px 0' }}>DATE :  24-10-2024</p>
                <p style={{ margin: '5px 0' }}>VENUE : RCCIIT College Campus Building</p>
            </div>

            <p style={{
                color: '#ffff00',
                fontSize: 'clamp(12px, 2.5vw, 16px)',
                marginBottom: '5px'
            }}>Please find your QR code attached to this email.</p>
            <p style={{
                color: '#ffff00',
                fontSize: 'clamp(12px, 2.5vw, 16px)',
                marginBottom: '20px'
            }}>{emailData.isVolunteer ? "The QR code  is mandatory for food." : "The QR code is mandatory for food and Merchandise"}</p>

            <div style={{
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: 'clamp(14px, 3vw, 18px)'
            }}>
                <p style={{ margin: '5px 0', color: '#ffffff' }}>Instructions :</p>
                <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                    {emailData.isVolunteer ? (
                        <>
                            <li>Volunteers are requested to report at the venue by 8:00 AM</li>
                        </>
                    ) : (
                        <>
                            <li>Students are requested to report at the venue by 10:00 AM</li>
                        </>
                    )
                    }
                </ul>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '10px',
                borderRadius: '20px',
                fontSize: 'clamp(14px, 3vw, 18px)'
            }}>
                <a
                    href="https://www.instagram.com/bihaan_rcciit/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: '#E1306C',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                    }}
                >
                    Follow us on Instagram @bihaan_rcciit
                </a>
            </div>

            <h2 style={{
                fontSize: 'clamp(28px, 6vw, 48px)',
                fontWeight: 'bold',
                color: '#ffffff',
                textShadow: '0 0 10px #ffffff',
                margin: '20px 0 10px'
            }}>
                BIHAAN 2024
            </h2>

            <p style={{
                color: '#ffffff',
                fontSize: 'clamp(14px, 3vw, 18px)',
                marginBottom: '15px'
            }}>#Discover_Connect_Vibe</p>

            <div style={{
                fontSize: 'clamp(10px, 2vw, 14px)',
                color: '#ffffff',
                textAlign: 'left'
            }}>
                <p style={{ margin: '5px 0' }}>For any Queries reach out to:</p>
                <p style={{ margin: '2px 0' }}>Samprit Rup  (SPOC BIHAAN ) - 6371655296</p>
                <p style={{ margin: '2px 0' }}>Basant Kumar Shaw (GS) - 7547627975</p>
                <p style={{ margin: '2px 0' }}>Manish Biswas (Cultural AGS) - 9062342650</p>
                <p style={{ margin: '2px 0' }}>Ankita Dhara  (Tech AGS) - 8820534958</p>
                {emailData.isVolunteer && (
                    <p style={{ margin: '2px 0' }}>Arnab Mondal (Technical Queries) - 6291912672</p>
                 )
                }
            </div>
        </div>
    );
}