const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const pug = require('pug');
const { convert } = require('html-to-text');

dotenv.config({ path: './.env' });

// ** SEND EMAIL CLASS ↓

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Lucas Da Silva <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // TODO Sendgrid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: convert(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 min)'
    );
  }
};

// ** OPTION TO SEND MAIL ↓

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
    // const transport = nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: Number(process.env.EMAIL_PORT),
    //   secure: false,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });
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
