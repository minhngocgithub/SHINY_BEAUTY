const nodeMailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config()
// Cấu hình Nodemailer
const transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_NAME,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});
module.exports = transporter