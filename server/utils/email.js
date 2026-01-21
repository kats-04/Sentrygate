import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

// Send email
export const sendEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'User Dashboard'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      ...(text && { text }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to User Dashboard!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome ${userName}!</h2>
        <p>Thank you for joining our User Dashboard platform.</p>
        <p>You can now:</p>
        <ul>
          <li>Manage your profile</li>
          <li>Create and join teams</li>
          <li>View analytics and reports</li>
          <li>Configure security settings</li>
        </ul>
        <p>Get started by logging into your account.</p>
        <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/login"
           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Login Now
        </a>
      </div>
    `,
  }),

  passwordReset: (resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/reset-password?token=${resetToken}"
           style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }),

  securityAlert: (action, details) => ({
    subject: 'Security Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Security Alert</h2>
        <p>We detected unusual activity on your account:</p>
        <p><strong>Action:</strong> ${action}</p>
        <p><strong>Details:</strong> ${details}</p>
        <p>If this wasn't you, please change your password immediately and review your security settings.</p>
        <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/security"
           style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Review Security
        </a>
      </div>
    `,
  }),

  teamInvitation: (teamName, inviterName) => ({
    subject: `You're invited to join ${teamName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Team Invitation</h2>
        <p>${inviterName} has invited you to join the team "${teamName}".</p>
        <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/teams"
           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Teams
        </a>
      </div>
    `,
  }),
};
