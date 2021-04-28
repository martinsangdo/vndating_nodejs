
const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
// const transporter = nodemailer.createTransport({
//     type: process.env.MAIL_DRIVER,
//     host: process.env.MAIL_HOST,
//     port: process.env.MAIL_PORT,
//     secureConnection: process.env.MAIL_ENCRYPTION, // true for 465, false for other ports
//     auth: {
//         user: process.env.MAIL_USERNAME, // generated ethereal user
//         pass: process.env.MAIL_PASSWORD, // generated ethereal password
//     },
//     tls: {
//         rejectUnauthorized: false, //force send with unauthorized
//     }
// });

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    logger: true,
    debug: true,
    auth: {
      user: "mernshop3393@gmail.com",
      pass: "mernshop@123"
    }
  });

exports.sendEmailForgotPassword = (params) => {
    const {email, token} = params
    return new Promise(resovle => {
        // send mail with defined transport object
        transporter.sendMail({
            from: process.env.FROM_EMAIL, // sender address
            to: [email, process.env.TO_EMAIL], // list of receivers
            subject: 'Password reset link',
            html: `
                <p>Please click this button to reset your password</p>
                <a href="${process.env.CLIENT_URL}/user/reset_password/${token}">Reset password</a>
                <p>Or copy the following link to reset your password</p>
                <p>${process.env.CLIENT_URL}/user/reset_password/${token}</p>
                <hr/>
                <p>This email may contain sensitive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `,
        }).then(resEmail => {
            console.log("Message sent: %s", resEmail.messageId);
            resovle({
                status: 1,
            })
        }).catch(err => {
            resovle({
                status: 0,
                data: err.message || err.msg
            })
        });
    })
}