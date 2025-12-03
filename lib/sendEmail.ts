// lib/sendEmail.ts

import nodemailer from "nodemailer";

interface PhaseUpdateEmailParams {
  to: string;
  customerName: string;
  requestId: number;
  projectName: string;
  phaseName: string;
  status: string;
  notes: string;
  attachments: Array<{ url: string; name: string }>;
}

export async function sendCredentialsEmail(
  to: string,
  username: string,
  tempPassword: string
) {
  // create transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail",
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
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0; padding:20px; background-color:#fff8ea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    
    <!-- Main Container -->
    <div style="max-width:650px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
      
      <!-- Header with Gradient (Landing Page Colors) -->
      <div style="background: linear-gradient(135deg, #f5b747 0%, #f28e1d 50%, #dc5034 100%); padding:40px 30px; text-align:center;">
        <div style="background:white; display:inline-block; padding:15px 25px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <div style="display:flex; align-items:center; justify-content:center; gap:15px;">
            <img src="https://inventory-service-omega.vercel.app/cticlogo.png" 
                 alt="CTIC Logo" 
                 style="height:55px; width:auto;">
            <div style="text-align:left;">
              <div style="font-size:18px; font-weight:bold; color:#173f63; line-height:1.2;">
                Canlubang Techno-Industrial Corporation
              </div>
              <div style="font-size:11px; color:#7c4722; font-style:italic; margin-top:2px;">
                GEARING TOWARDS EXCELLENCE
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div style="padding:40px 35px;">
        
        <!-- Greeting -->
        <h2 style="color:#173f63; font-size:24px; margin:0 0 10px 0; font-weight:600;">
          🔐 Your CTIC System Account
        </h2>
        <p style="color:#4f2d12; font-size:15px; line-height:1.6; margin:0 0 25px 0;">
          Hello,
        </p>
        <p style="color:#4f2d12; font-size:15px; line-height:1.6; margin:0 0 30px 0;">
          An account has been created for you in the CTIC System. Please use the credentials below to sign in and <strong>change your password immediately</strong> for security.
        </p>

        <!-- Credentials Card -->
        <div style="background:linear-gradient(135deg, #fff6f5 0%, #ffedce 100%); 
                    border-left:4px solid #f28e1d; 
                    padding:20px; 
                    border-radius:10px; 
                    margin:25px 0;">
          <h3 style="color:#173f63; font-size:16px; margin:0 0 15px 0; font-weight:600;">
            Login Credentials
          </h3>
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; color:#7c4722; font-weight:600; font-size:14px; width:180px;">Username:</td>
              <td style="padding:8px 0; color:#173f63; font-size:14px; font-weight:500;">
                <code style="background:#f3f4f6; padding:4px 8px; border-radius:4px; font-family:monospace;">${username}</code>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#7c4722; font-weight:600; font-size:14px;">Temporary Password:</td>
              <td style="padding:8px 0; color:#173f63; font-size:14px; font-weight:500;">
                <code style="background:#f3f4f6; padding:4px 8px; border-radius:4px; font-family:monospace;">${tempPassword}</code>
              </td>
            </tr>
          </table>
        </div>

        <!-- Important Notice -->
        <div style="margin:30px 0; padding:20px; background:#fff6f5; border-radius:10px; border:1px solid #fed795; border-left:4px solid #dc5034;">
          <h3 style="color:#dc5034; font-size:16px; margin:0 0 10px 0; font-weight:600; display:flex; align-items:center; gap:8px;">
            ⚠️ Important Security Notice
          </h3>
          <ul style="color:#4f2d12; font-size:14px; line-height:1.7; margin:10px 0; padding-left:20px;">
            <li>This is a <strong>temporary password</strong>. You must change it upon first login.</li>
            <li>Do not share your credentials with anyone.</li>
            <li>Keep your password secure and confidential.</li>
            <li>If you didn't expect this account creation, contact your administrator immediately.</li>
          </ul>
        </div>

        <!-- Call to Action -->
        <div style="margin:35px 0 25px 0; text-align:center;">
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL ||
            "https://inventory-service-omega.vercel.app"
          }/sign-in" 
             style="display:inline-block; 
                    background:#173f63; 
                    color:white; 
                    padding:14px 32px; 
                    border-radius:8px; 
                    text-decoration:none; 
                    font-weight:600; 
                    font-size:15px;
                    box-shadow:0 2px 4px rgba(23,63,99,0.2);">
            Sign In to CTIC System
          </a>
        </div>

        <!-- Password Requirements -->
        <div style="margin:30px 0; padding:18px; background:#f9fafb; border-radius:8px; border:1px solid #e5e7eb;">
          <h3 style="color:#173f63; font-size:14px; margin:0 0 10px 0; font-weight:600;">
            Password Requirements:
          </h3>
          <ul style="color:#374151; font-size:13px; line-height:1.6; margin:0; padding-left:20px;">
            <li>At least 8 characters long</li>
            <li>Include at least one uppercase letter</li>
            <li>Include at least one number</li>
            <li>Include at least one special character</li>
          </ul>
        </div>

        <p style="color:#4f2d12; font-size:14px; line-height:1.6; margin:30px 0 0 0;">
          If you have any questions or need assistance, please contact our IT support team.
        </p>

      </div>

      <!-- Footer -->
      <div style="background:#f3f4f6; padding:25px 35px; border-top:1px solid #e5e7eb;">
        <p style="color:#6b7280; font-size:13px; line-height:1.6; margin:0 0 8px 0;">
          <strong>Canlubang Techno-Industrial Corporation</strong><br>
          530 CTIC Bldg., Brgy. Sirang Lupa, Calamba City, Laguna<br>
          Phone: +49 5480 824<br>
          Email: canlubangtechnoindustrialcorpo@gmail.com
        </p>
        <hr style="border:none; border-top:1px solid #d1d5db; margin:15px 0;">
        <p style="color:#9ca3af; font-size:12px; margin:0; font-style:italic;">
          This is an automated message from CTIC System. Please do not reply directly to this email.
        </p>
      </div>

    </div>

  </body>
  </html>
  `;

  const info = await transporter.sendMail({
    from: `"CTIC - Account Setup" <${process.env.GMAIL_USER}>`,
    to,
    subject: "🔐 Your CTIC System Account Credentials",
    html,
  });

  return info;
}

export async function sendPhaseUpdateEmail({
  to,
  customerName,
  requestId,
  projectName,
  phaseName,
  status,
  notes,
  attachments,
}: PhaseUpdateEmailParams) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  if (process.env.NODE_ENV === "development") {
    await transporter.verify();
  }

  const attachmentList = attachments
    .map(
      (att) =>
        `<li style="margin:8px 0;">
          <a href="${att.url}" 
             target="_blank" 
             style="color:#173f63; text-decoration:none; font-weight:500; display:inline-flex; align-items:center; gap:6px;">
            <span style="background:#f3f4f6; padding:4px 8px; border-radius:4px; font-size:13px;">📎</span>
            ${att.name}
          </a>
        </li>`
    )
    .join("");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0; padding:20px; background-color:#fff8ea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    
    <!-- Main Container -->
    <div style="max-width:650px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
      
      <!-- Header with Gradient (Landing Page Colors) -->
      <div style="background: linear-gradient(135deg, #f5b747 0%, #f28e1d 50%, #dc5034 100%); padding:40px 30px; text-align:center;">
        <div style="background:white; display:inline-block; padding:15px 25px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <div style="display:flex; align-items:center; justify-content:center; gap:15px;">
            <img src="https://inventory-service-omega.vercel.app/cticlogo.png" 
                 alt="CTIC Logo" 
                 style="height:55px; width:auto;">
            <div style="text-align:left;">
              <div style="font-size:18px; font-weight:bold; color:#173f63; line-height:1.2;">
                Canlubang Techno-Industrial Corporation
              </div>
              <div style="font-size:11px; color:#7c4722; font-style:italic; margin-top:2px;">
                GEARING TOWARDS EXCELLENCE
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div style="padding:40px 35px;">
        
        <!-- Greeting -->
        <h2 style="color:#173f63; font-size:24px; margin:0 0 10px 0; font-weight:600;">
          Project Status Update
        </h2>
        <p style="color:#4f2d12; font-size:15px; line-height:1.6; margin:0 0 25px 0;">
          Dear <strong>${customerName}</strong>,
        </p>
        <p style="color:#4f2d12; font-size:15px; line-height:1.6; margin:0 0 30px 0;">
          We're pleased to update you on the progress of your project. Please review the details below.
        </p>

        <!-- Project Info Card -->
        <div style="background:linear-gradient(135deg, #fff6f5 0%, #ffedce 100%); 
                    border-left:4px solid #f28e1d; 
                    padding:20px; 
                    border-radius:10px; 
                    margin:25px 0;">
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; color:#7c4722; font-weight:600; font-size:14px; width:140px;">Project Name:</td>
              <td style="padding:8px 0; color:#173f63; font-size:14px; font-weight:500;">${projectName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#7c4722; font-weight:600; font-size:14px;">Request ID:</td>
              <td style="padding:8px 0; color:#173f63; font-size:14px; font-weight:500;">#${requestId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#7c4722; font-weight:600; font-size:14px;">Phase:</td>
              <td style="padding:8px 0; color:#173f63; font-size:14px; font-weight:500;">${phaseName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#7c4722; font-weight:600; font-size:14px;">Status:</td>
              <td style="padding:8px 0;">
                <span style="background:#10b981; 
                             color:white; 
                             padding:6px 14px; 
                             border-radius:20px; 
                             font-size:13px; 
                             font-weight:600; 
                             display:inline-block;">
                  ${status}
                </span>
              </td>
            </tr>
          </table>
        </div>

        ${
          notes
            ? `
        <!-- Update Notes -->
        <div style="margin:30px 0;">
          <h3 style="color:#173f63; font-size:16px; margin:0 0 12px 0; font-weight:600; display:flex; align-items:center; gap:8px;">
            <span style="background:#f28e1d; width:4px; height:20px; display:inline-block; border-radius:2px;"></span>
            Update Notes
          </h3>
          <div style="background:#f9fafb; 
                      padding:18px; 
                      border-radius:8px; 
                      border:1px solid #e5e7eb;">
            <p style="color:#374151; font-size:14px; line-height:1.7; margin:0; white-space:pre-line;">
              ${notes}
            </p>
          </div>
        </div>
        `
            : ""
        }

        ${
          attachments.length > 0
            ? `
        <!-- Attached Files -->
        <div style="margin:30px 0;">
          <h3 style="color:#173f63; font-size:16px; margin:0 0 12px 0; font-weight:600; display:flex; align-items:center; gap:8px;">
            <span style="background:#f28e1d; width:4px; height:20px; display:inline-block; border-radius:2px;"></span>
            Attached Files (${attachments.length})
          </h3>
          <div style="background:#f9fafb; 
                      padding:18px; 
                      border-radius:8px; 
                      border:1px solid #e5e7eb;">
            <ul style="list-style:none; padding:0; margin:0;">
              ${attachmentList}
            </ul>
          </div>
        </div>
        `
            : ""
        }

        <!-- Call to Action -->
        <div style="margin:35px 0 25px 0; padding:20px; background:#fff6f5; border-radius:10px; border:1px solid #fed795;">
          <p style="color:#4f2d12; font-size:14px; line-height:1.6; margin:0 0 15px 0;">
            If you have any questions or concerns about this update, please don't hesitate to reach out to our team.
          </p>
          <a href="mailto:canlubangtechnoindustrialcorpo@gmail.com" 
             style="display:inline-block; 
                    background:#173f63; 
                    color:white; 
                    padding:12px 28px; 
                    border-radius:8px; 
                    text-decoration:none; 
                    font-weight:600; 
                    font-size:14px;
                    box-shadow:0 2px 4px rgba(23,63,99,0.2);">
            Contact Us
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="background:#f3f4f6; padding:25px 35px; border-top:1px solid #e5e7eb;">
        <p style="color:#6b7280; font-size:13px; line-height:1.6; margin:0 0 8px 0;">
          <strong>Canlubang Techno-Industrial Corporation</strong><br>
          530 CTIC Bldg., Brgy. Sirang Lupa, Calamba City, Laguna<br>
          Phone: +49 5480 824<br>
          Email: canlubangtechnoindustrialcorpo@gmail.com
        </p>
        <hr style="border:none; border-top:1px solid #d1d5db; margin:15px 0;">
        <p style="color:#9ca3af; font-size:12px; margin:0; font-style:italic;">
          This is an automated message from CTIC System. Please do not reply directly to this email.
        </p>
      </div>

    </div>

  </body>
  </html>
  `;

  const info = await transporter.sendMail({
    from: `"CTIC - Project Updates" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🔔 Project Update: ${projectName} - ${phaseName}`,
    html,
  });

  return info;
}

