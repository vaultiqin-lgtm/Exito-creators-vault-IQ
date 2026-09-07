import nodemailer from "nodemailer";

/**
 * Service to handle dispatching HTML email messages via Nodemailer.
 * Configured to use Gmail SMTP or custom SMTP credentials from environment variables.
 */

// Initialize Nodemailer transporter with connection settings
const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER || gmailUser;
  const smtpPass = process.env.SMTP_PASS || gmailPass;

  if (smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Return direct transport fallback or null if unconfigured
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser || "vaultiq.verify@gmail.com",
      pass: gmailPass || "unconfigured",
    },
  });
};

/**
 * Sends a high-security professional HTML email containing the 6-digit OTP to the user's Gmail inbox.
 */
export const sendOtpEmail = async (
  email: string,
  otp: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER || "vaultiq.verify@gmail.com";
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vault IQ Security OTP Verification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f0; margin: 0; padding: 20px; color: #2d302d; }
        .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid #deddda; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #5a5a40; }
        .title { font-size: 22px; font-weight: 700; color: #5a5a40; margin: 8px 0 0 0; letter-spacing: 0.05em; }
        .subtitle { font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }
        .content { padding: 24px 0; text-align: center; }
        .otp-container { background-color: #f5f5f0; border: 2px dashed #5a5a40; border-radius: 16px; padding: 20px; margin: 20px 0; display: inline-block; width: 80%; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #2d302d; letter-spacing: 12px; margin: 0; }
        .expiry-badge { display: inline-block; background-color: #fff3cd; color: #856404; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 20px; margin-top: 10px; }
        .warning { background-color: #fcf8e3; border-left: 4px solid #f0ad4e; padding: 12px 16px; font-size: 12px; color: #6c5400; text-align: left; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; font-size: 11px; color: #999999; margin-top: 24px; border-top: 1px solid #eeeeee; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="title">VAULT IQ</div>
          <div class="subtitle">Secure Verification Gateway</div>
        </div>
        <div class="content">
          <p style="font-size: 14px; color: #4a4a4a; margin-bottom: 12px;">Hello,</p>
          <p style="font-size: 14px; color: #4a4a4a; line-height: 1.5;">You requested a One-Time Password (OTP) to authenticate your Vault IQ account.</p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
          </div>

          <div>
            <span class="expiry-badge">⏱️ Valid for 5 Minutes</span>
          </div>

          <div class="warning">
            <strong>⚠️ Security Alert:</strong> Never share this 6-digit OTP code with anyone. Vault IQ support team will never ask for your verification code.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Vault IQ Digital Security. All rights reserved.<br>
          This is an automated message sent to ${email}. Please do not reply.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = createTransporter();

    // Check if SMTP password is set
    if (!gmailPass && !process.env.SMTP_PASS) {
      console.warn(`\n======================================================`);
      console.warn(`[GMAIL OTP SERVICE WARNING] GMAIL_APP_PASSWORD is not set in .env.`);
      console.warn(`To send REAL emails to inbox, please provide GMAIL_APP_PASSWORD in .env.`);
      console.warn(`[DEVELOPMENT BACKEND LOG] Generated Gmail OTP for ${email}: ${otp}`);
      console.warn(`======================================================\n`);

      // Return success in local environment so dev flow works without crashing
      return {
        success: true,
        messageId: `dev_mock_${Date.now()}`,
      };
    }

    const info = await transporter.sendMail({
      from: `"Vault IQ Security" <${gmailUser}>`,
      to: email,
      subject: `Vault IQ Authentication Code: ${otp}`,
      text: `Your Vault IQ security code is ${otp}. Valid for 5 minutes. Do NOT share this code.`,
      html: htmlTemplate,
    });

    console.log(`[GMAIL OTP DISPATCHED] Email sent successfully to ${email} (Message ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error(`[GMAIL OTP EMAIL ERROR] Failed to send email to ${email}:`, error);

    // Fallback log for development context
    console.warn(`[DEVELOPMENT BACKEND LOG] Fallback OTP generated for ${email}: ${otp}`);

    return {
      success: false,
      error: error?.message || "Failed to deliver email via Nodemailer SMTP service.",
    };
  }
};
