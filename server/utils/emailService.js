const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Development Fallback: Ethereal test account or console logger
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (err) {
    console.warn('Ethereal test account creation failed, fallback to mock transporter:', err.message);
    return null;
  }
};

/**
 * Send Booking Confirmation Email with PDF Ticket attachment
 */
const sendBookingConfirmation = async (userEmail, userName, booking, pdfBuffer) => {
  try {
    const transporter = await createTransporter();
    const flight = booking.flight || {};
    const depAirport = flight.departureAirport || {};
    const arrAirport = flight.arrivalAirport || {};

    const mailOptions = {
      from: `"SkyWings Airlines" <${process.env.EMAIL_FROM || 'no-reply@skywings.com'}>`,
      to: userEmail,
      subject: `✈️ Booking Confirmed: ${booking.pnr} (${depAirport.city || 'Origin'} to ${arrAirport.city || 'Dest'})`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
          <h2 style="color: #38bdf8; margin-top: 0;">✈️ SkyWings Airlines - Booking Confirmed!</h2>
          <p>Dear <strong>${userName || 'Valued Traveler'}</strong>,</p>
          <p>Thank you for choosing SkyWings Airlines. Your booking has been confirmed with the following details:</p>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; border-left: 4px solid #38bdf8; margin: 20px 0;">
            <p style="margin: 6px 0;"><strong>PNR Reference:</strong> <span style="font-size: 18px; color: #38bdf8; letter-spacing: 2px;">${booking.pnr}</span></p>
            <p style="margin: 6px 0;"><strong>Flight:</strong> ${flight.flightNumber || 'N/A'}</p>
            <p style="margin: 6px 0;"><strong>Route:</strong> ${depAirport.city || ''} (${depAirport.code || ''}) ➔ ${arrAirport.city || ''} (${arrAirport.code || ''})</p>
            <p style="margin: 6px 0;"><strong>Departure:</strong> ${flight.departureTime || ''} on ${new Date(flight.departureDate).toLocaleDateString()}</p>
            <p style="margin: 6px 0;"><strong>Total Paid:</strong> ₹${booking.totalAmount}</p>
          </div>

          <p>Your official <strong>E-Ticket / Boarding Pass (PDF)</strong> is attached to this email.</p>
          <p style="color: #94a3b8; font-size: 13px;">Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights.</p>
          
          <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">© 2026 SkyWings Airlines. All rights reserved.</p>
        </div>
      `,
      attachments: pdfBuffer ? [
        {
          filename: `E-Ticket-${booking.pnr}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ] : []
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Booking confirmation sent to ${userEmail}. Message ID: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`[Email Service] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return true;
    } else {
      console.log(`[Email Mock] Would send booking confirmation to ${userEmail} for PNR ${booking.pnr}`);
      return false;
    }
  } catch (error) {
    console.error('[Email Service Error]', error.message);
    return false;
  }
};

/**
 * Send Password Reset OTP
 */
const sendPasswordResetOTP = async (userEmail, userName, otp) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"SkyWings Airlines" <${process.env.EMAIL_FROM || 'no-reply@skywings.com'}>`,
      to: userEmail,
      subject: `🔒 SkyWings Account Password Reset OTP`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
          <h2 style="color: #38bdf8; margin-top: 0;">Password Reset Request</h2>
          <p>Hello <strong>${userName || 'User'}</strong>,</p>
          <p>We received a request to reset your SkyWings Airlines account password. Use the verification code below:</p>
          
          <div style="background: #1e293b; text-align: center; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #38bdf8; letter-spacing: 8px;">${otp}</span>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 8px; margin-bottom: 0;">Code is valid for 10 minutes</p>
          </div>

          <p style="color: #94a3b8; font-size: 13px;">If you did not request this password reset, please ignore this email or contact support immediately.</p>
          
          <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">© 2026 SkyWings Airlines. All rights reserved.</p>
        </div>
      `
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Password reset OTP sent to ${userEmail}. Message ID: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`[Email Service] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return true;
    } else {
      console.log(`[Email Mock] Would send OTP ${otp} to ${userEmail}`);
      return false;
    }
  } catch (error) {
    console.error('[Email Service Error]', error.message);
    return false;
  }
};

module.exports = {
  sendBookingConfirmation,
  sendPasswordResetOTP
};
