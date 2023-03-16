const nodemailer = require("nodemailer");

const sendEmail =async  (options) => {
  //1 create a transporter

  const transporter = nodemailer.createTransport({
    // service:"Gmail",
    // auth: {
    //   user: process.env.EMAIL_USERNAME,
    //   password: process.env.EMAIL_PASSWORD
    // }
    //activate "less secure app" option in gmail
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
  })

  //2 email options
  const mailOptions = {
    from: "Ragul A <ragula878@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  //3 send the email with node mailer
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail 