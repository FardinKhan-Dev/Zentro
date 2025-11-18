import nodemailer from 'nodemailer';
import 'dotenv/config';

const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
const user = process.env.SMTP_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const to = process.env.EMAIL_TEST_TO || process.env.EMAIL_USER;

if (!user || !pass) {
  console.error('SMTP credentials not found in environment');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true for 465
  auth: {
    user,
    pass,
  },
});

(async () => {
  try {
    await transporter.verify();
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Zentro SMTP Test Email',
      text: `This is a test email sent by the Zentro CI SMTP validation workflow on ${new Date().toISOString()}`,
    });
    console.log('Test email sent:', info.messageId);
    process.exit(0);
  } catch (err) {
    console.error('SMTP test failed:', err?.message || err);
    process.exit(2);
  }
})();
