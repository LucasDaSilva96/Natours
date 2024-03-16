const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const sendEmail = async (options) => {
  try {
    // 1) Create a transporter
    // ** GMAIL
    //  const transporter = nodemailer.createTransport({
    //   service: 'Gmail',
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // Activate in gmail "less secure app" option
    // });
    // ** mailtrap.io
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    // 2) Define the email options
    const mailOptions = {
      from: 'Lucas Da Silva <test@gmail.com>',
      to: '1bd7c4d766-0008ee+1@inbox.mailtrap.io',
      subject: options.subject,
      text: options.message,
      // html
    };
    // 3) Actually send email
    await transport.sendMail(mailOptions);
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = sendEmail;
