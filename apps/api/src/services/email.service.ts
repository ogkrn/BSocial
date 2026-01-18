import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { config } from '../config/index.js';

// Initialize Resend if API key is provided
const resendApiKey = process.env.RESEND_API_KEY;
let resend: Resend | null = null;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
  console.log('✅ Resend email service configured');
}

// Check if SMTP email is configured (fallback)
const isSmtpConfigured = () => {
  return !!(
    config.email.host &&
    config.email.user &&
    config.email.pass &&
    config.email.user !== 'your-email@gmail.com'
  );
};

let transporter: nodemailer.Transporter | null = null;

if (!resend && isSmtpConfigured()) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
  console.log('✅ SMTP email transporter configured');
} else if (!resend) {
  console.warn('⚠️ Email not configured. Set RESEND_API_KEY in .env to enable email sending.');
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<void> => {
  // Try Resend first (recommended)
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: 'BSocial <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      });
      
      if (error) {
        console.error('Resend error:', error);
        throw new Error('Failed to send email via Resend');
      }
      
      console.log(`✅ Email sent to ${to} via Resend`);
      return;
    } catch (err) {
      console.error('Resend error:', err);
      throw new Error('Failed to send email');
    }
  }

  // Fallback to SMTP
  if (transporter) {
    try {
      await transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to} via SMTP`);
      return;
    } catch (error) {
      console.error('SMTP error:', error);
      throw new Error('Failed to send email');
    }
  }

  // No email service configured - log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 [DEV MODE] Email would be sent to:', to);
    console.log('📧 [DEV MODE] Subject:', subject);
    return;
  }
  
  throw new Error('Email service not configured. Please set RESEND_API_KEY in .env');
};

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  // In development without email configured, log OTP to console
  if (!resend && !transporter && process.env.NODE_ENV === 'development') {
    console.log('\n' + '='.repeat(50));
    console.log('📧 OTP CODE FOR DEVELOPMENT');
    console.log('='.repeat(50));
    console.log(`Email: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log('='.repeat(50) + '\n');
    return;
  }

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
          <p>Your Social Platform</p>
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
          <p>© ${new Date().getFullYear()} BSocial - All rights reserved</p>
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
          <p>Welcome to the BSocial community!</p>
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
          <p>© ${new Date().getFullYear()} BSocial - All rights reserved</p>
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
