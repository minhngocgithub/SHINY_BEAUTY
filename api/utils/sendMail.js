const transporter = require('../config/nodemailer')

const sendMail = async({email, subject, html}) => {
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"QueenShop" <no-relply@queenshop.com>', // sender address
        to: email, // list of receivers
        subject: subject || "Forgot password", // Subject line
        html: html, // html body
    });

    return info
}

module.exports = sendMail
