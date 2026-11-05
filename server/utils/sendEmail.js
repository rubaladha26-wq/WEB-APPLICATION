const nodemailer = require('nodemailer');
const Setting = require('../models/Setting');

/**
 * Transporter and email sending utility
 */
const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  const setting = await Setting.findOne();

  let transporter;

  if (setting?.emailConfig?.user && setting?.emailConfig?.password) {
    transporter = nodemailer.createTransport({
      host: setting.emailConfig.host,
      port: setting.emailConfig.port,
      secure: setting.emailConfig.secure,
      auth: {
        user: setting.emailConfig.user,
        pass: setting.emailConfig.password,
      },
    });
  } else {
    // Generate test transporter (e.g. ethereal / fallback console)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const mailOptions = {
    from: `"${setting?.emailConfig?.fromName || 'Nexus Billing'}" <${
      setting?.emailConfig?.fromEmail || 'no-reply@nexusbill.com'
    }>`,
    to,
    subject,
    text,
    html,
    attachments,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email] Message sent: %s (Preview URL: %s)`, info.messageId, nodemailer.getTestMessageUrl(info));
  return info;
};

module.exports = sendEmail;

