const nodemailer = require('nodemailer');

// Create Transporter
const createTransporter = () => {
  // If credentials are empty, return null to fallback to log mode
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendMail = async (options) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'SkyWings <noreply@skywings.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`
  };

  if (!transporter) {
    console.log('============================================================');
    console.log(`MOCK EMAIL SENT (SMTP Not configured in .env):`);
    console.log(`To: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Content: ${mailOptions.text}`);
    console.log('============================================================');
    return { mock: true, message: 'Email logged successfully in mock mode.' };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Message sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending failed, logging email content instead:', error);
    return { error: true, message: error.message };
  }
};

module.exports = { sendMail };
