import nodemailer from 'nodemailer';
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

let transporter;

export const initializeEmailService = () => {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
    pool: true,
    maxMessages: 1000,
    maxConnections: 10,
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
    from: process.env.EMAIL_FROM,
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

export const sendOrderConfirmationEmail = async (email, orderDetails) => {
  const { orderNumber, customerName, items, totalAmount, shippingAddress } = orderDetails;

  // Build items HTML
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.images ? `<img src="${item.images[0]}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">` : ''}
          ${item.name}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">$${item.subtotal.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; background: white; }
        th { background: #f0f0f0; padding: 12px; text-align: left; }
        .total { font-size: 18px; font-weight: bold; color: #4CAF50; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
          <p>Thank you for your order, ${customerName}!</p>
        </div>
        
        <div class="content">
          <div class="order-info">
            <h2>Order #${orderNumber}</h2>
            <p><strong>Status:</strong> <span style="color: #4CAF50;">Payment Received</span></p>
            <p>We're processing your order and will send you a shipping confirmation soon.</p>
          </div>

          <h3>Order Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 15px; text-align: right;" class="total">$${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="order-info">
            <h3>Shipping Address</h3>
            <p>
              ${shippingAddress.street}<br>
              ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
              ${shippingAddress.country || 'US'}<br>
              ${shippingAddress.phoneNumber}
            </p>
          </div>

          <p style="margin-top: 20px;">
            <strong>Need help?</strong> Contact our support team at support@zentro.com
          </p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Zentro. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    email,
    subject: `Order Confirmation - #${orderNumber}`,
    html,
  });
};

export const sendShippingNotificationEmail = async (email, orderDetails, trackingNumber) => {
  const { orderNumber, customerName, items, shippingAddress } = orderDetails;

  const itemsList = items
    .map((item) => `<li>${item.name} (x${item.quantity})</li>`)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .tracking { background: white; padding: 20px; margin: 20px 0; border: 2px dashed #2196F3; border-radius: 5px; text-align: center; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #2196F3; letter-spacing: 2px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order Has Shipped!</h1>
          <p>Hi ${customerName}, great news!</p>
        </div>
        
        <div class="content">
          <p>Your order #${orderNumber} is on its way!</p>

          <div class="tracking">
            <p style="margin: 0; font-size: 14px; color: #666;">Tracking Number</p>
            <p class="tracking-number">${trackingNumber}</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #888;">
              You can track your package with your carrier using this number
            </p>
          </div>

          <div class="info-box">
            <h3>Items Shipped</h3>
            <ul style="list-style: none; padding: 0;">
              ${itemsList}
            </ul>
          </div>

          <div class="info-box">
            <h3>Shipping To</h3>
            <p>
              ${shippingAddress.street}<br>
              ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
              ${shippingAddress.country || 'US'}<br>
              ${shippingAddress.phoneNumber}
            </p>
          </div>

          <p style="margin-top: 20px;">
            <strong>Questions?</strong> Contact us at support@zentro.com
          </p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Zentro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    email,
    subject: `Your Order Has Shipped - #${orderNumber}`,
    html,
  });
};

export const sendOrderCancellationEmail = async (email, orderDetails, reason) => {
  const { orderNumber, customerName, totalAmount } = orderDetails;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #f44336; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Cancelled</h1>
          <p>Order #${orderNumber}</p>
        </div>
        
        <div class="content">
          <p>Hi ${customerName},</p>
          <p>Your order #${orderNumber} has been cancelled.</p>

          ${reason ? `
            <div class="info-box">
              <h3>Cancellation Reason</h3>
              <p>${reason}</p>
            </div>
          ` : ''}

          <div class="info-box">
            <h3>Refund Information</h3>
            <p>
              ${totalAmount > 0 ? `A refund of $${totalAmount.toFixed(2)} will be processed to your original payment method within 5-7 business days.` : 'No payment was processed for this order.'}
            </p>
          </div>

          <p style="margin-top: 20px;">
            We're sorry to see your order cancelled. If you have any questions or if this was a mistake, please contact our support team immediately at support@zentro.com
          </p>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
              Continue Shopping
            </a>
          </p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Zentro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    email,
    subject: `Order Cancelled - #${orderNumber}`,
    html,
  });
};

export default {
  initializeEmailService,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendOrderCancellationEmail,
};
