const nodemailer = require('nodemailer');

/**
 * Creates a transporter for Ethereal Email (Simulated Email Testing)
 * For production, replace this with a real SMTP like SendGrid, Gmail, etc.
 */
let transporter = null;

const initMailer = async () => {
  if (transporter) return transporter;
  try {
    // Generate a test account on the fly for Ethereal
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log('✉️  Ethereal Email Transporter initialized');
    return transporter;
  } catch (err) {
    console.error('Error initializing mailer:', err);
    return null;
  }
};

const sendEmail = async (to, subject, text) => {
  try {
    const t = await initMailer();
    if (!t) throw new Error('Mailer not initialized');

    const info = await t.sendMail({
      from: '"Laundry Admin" <admin@laundry.local>', // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
    });

    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
  } catch (err) {
    console.error('Email send error:', err);
    throw err;
  }
};

module.exports = { sendEmail };
