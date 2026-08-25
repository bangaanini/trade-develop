import nodemailer from 'nodemailer';

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Gmail App Password
  },
});

/**
 * Send OTP email to user
 * @param email - Recipient email address
 * @param otpCode - 6-digit OTP code
 * @returns Promise with success status
 */
export async function sendOTPEmail(email: string, otpCode: string) {
  const mailOptions = {
    from: `"Trading Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code - Email Verification',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #11224a 0%, #1a2f5a 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .otp-code {
            background: #f8f9fa;
            border: 2px dashed #11224a;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #11224a;
          }
          .info {
            color: #666;
            font-size: 14px;
            margin-top: 20px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; color: #333;">
              Thank you for registering! Please use the following OTP code to complete your registration:
            </p>
            <div class="otp-code">${otpCode}</div>
            <div class="info">
              <p>⏱️ This code will expire in <strong>5 minutes</strong></p>
              <p>🔒 For your security, do not share this code with anyone</p>
            </div>
            <p style="margin-top: 30px; color: #666;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>Trading Platform - Secure Email Verification</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email after successful registration
 * @param email - User email address
 */
export async function sendWelcomeEmail(email: string) {
  const mailOptions = {
    from: `"Trading Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Trading Platform! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px;">
          <h1 style="color: #11224a;">Welcome to Trading Platform! 🎉</h1>
          <p>Your account has been successfully created and verified.</p>
          <p>You can now:</p>
          <ul>
            <li>✅ Trade options and spot</li>
            <li>✅ Deposit and withdraw funds</li>
            <li>✅ Access all trading features</li>
          </ul>
          <p>Get started by logging in to your account.</p>
          <a href="https://tradefreedoms.com/login" style="display: inline-block; background: #11224a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Login Now
          </a>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Welcome email failed:', error);
    return { success: false, error: error.message };
  }
}
