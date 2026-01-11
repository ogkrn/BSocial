import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 BSocial</h1>
          <p>UTU University Social Platform</p>
        </div>
        <div class="content">
          <h2>Verify Your Email</h2>
          <p>Hello!</p>
          <p>Your verification code for BSocial is:</p>
          <div class="otp-code">${otp}</div>
          <p>This code will expire in <strong>${config.otpExpiryMinutes} minutes</strong>.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} BSocial - Made for UTU Students</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `${otp} - Your BSocial Verification Code`,
    html,
  });
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to BSocial!</h1>
        </div>
        <div class="content">
          <h2>Hey ${name}! 👋</h2>
          <p>Welcome to the UTU University student community!</p>
          <p>Here's what you can do on BSocial:</p>
          <ul>
            <li>📝 Share posts and updates with your peers</li>
            <li>💬 Message fellow students directly</li>
            <li>🎭 Follow club pages like Dramatics, Sports, and more</li>
            <li>🔍 Discover and connect with classmates</li>
          </ul>
          <p style="text-align: center;">
            <a href="${config.appUrl}" class="cta-button">Start Exploring</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} BSocial - Made for UTU Students</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Welcome to BSocial, ${name}! 🎉`,
    html,
  });
};
