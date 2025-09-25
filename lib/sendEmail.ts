// lib/sendEmail.ts

import nodemailer from "nodemailer";

export async function sendCredentialsEmail(to: string, username: string, tempPassword: string) {
    // create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASS,
        },
    });

    // verify connection verification
    if (process.env.NODE_ENV === "development") {
        await transporter.verify();
    }
    
    const html = `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; max-width:600px;">
    <!-- Logo + Company Info -->
    <div style="display:flex; align-items:center; margin-bottom:20px;">
      <!-- Logo -->
      <div style="flex-shrink:0; margin-right:15px;">
        <img src="https://inventory-service-omega.vercel.app/cticlogo.png" alt="CTIC Logo" style="height:60px; width:auto;">
      </div>
      <!-- Company Name + Mantra -->
      <div>
        <div style="font-size:20px; font-weight:bold; color:#0f172a;">Canlubang Techno-Industrial Corporation</div>
        <div style="font-size:14px; color:#6b7280; italic">GEARING TOWARDS EXELLENCE</div>
      </div>
    </div>

    <!-- Email Header -->
    <h2 style="color:#0f172a; margin-top:0;">Your CTIC System Account</h2>
    <p>Hello,</p>
    <p>An account was created for you. Use the credentials below to sign in and change your password immediately.</p>
    <ul>
      <li><strong>Username:</strong> ${username}</li>
      <li><strong>Temporary Password:</strong> ${tempPassword}</li>
    </ul>
    <p>If you didn't expect this, contact your administrator.</p>
    <hr />
    <small style="color:#6b7280">This is an automated message from CTIC System.</small>
  </div>
`;


const info = await transporter.sendMail({
    from: `"CTIC System" <${process.env.GMAIL_USER}>`,
    to,
    subject: "CTIC System — Your account credentials",
    html,
});

return info;
}