const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASSWORD || 'your-app-password'
    }
  });

  // Email options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const subject = 'Reset your password - ApplyNext Platform';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .title {
          color: #1f2937;
          font-size: 20px;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: #ffffff;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 500;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .warning {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 ApplyNext Platform</div>
          <h1 class="title">Password Reset Request</h1>
        </div>
        
        <div class="content">
          <p>Hello,</p>
          <p>You have requested to reset your password for your ApplyNext Platform account.</p>
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <div class="warning">
            <strong>Important:</strong> This link will expire in 15 minutes for security reasons.
          </div>
          
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
        </div>
        
        <div class="footer">
          <p>This email was sent from ApplyNext Platform</p>
          <p>If you have any questions, please contact our support team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    email,
    subject,
    html
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail
}; 