import nodemailer from 'nodemailer';

let transporter;

export const initializeEmailService = () => {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.warn('⚠ Email service not configured:', error.message);
    } else {
      console.log('✓ Email service ready');
    }
  });

  return transporter;
};

export const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    if (!transporter) {
      // Test mode or uninitialized transporter: stub the send
      console.log(`(stub) Email send to ${options.email}: subject=${options.subject}`);
      return { messageId: 'stubbed-message-id', accepted: [options.email] };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent to ${options.email}:`, info.messageId);
    return info;
  } catch (error) {
    console.error('✗ Email error:', error.message);
    throw error;
  }
};

export const sendVerificationEmail = async (email, verificationUrl) => {
  const html = `
    <h2>Email Verification</h2>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
      Verify Email
    </a>
    <p>This link expires in 24 hours.</p>
    <p>If you didn't create this account, please ignore this email.</p>
  `;

  return sendEmail({
    email,
    subject: 'Email Verification - Zentro',
    html,
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
      Reset Password
    </a>
    <p>This link expires in 30 minutes.</p>
    <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
  `;

  return sendEmail({
    email,
    subject: 'Password Reset - Zentro',
    html,
  });
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <h2>Welcome to Zentro, ${name}!</h2>
    <p>Thank you for signing up. We're excited to have you on board.</p>
    <p>Start shopping and enjoying our products today.</p>
  `;

  return sendEmail({
    email,
    subject: 'Welcome to Zentro',
    html,
  });
};

export default {
  initializeEmailService,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
