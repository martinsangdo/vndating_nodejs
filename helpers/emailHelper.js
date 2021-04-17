
const {errorHandler} = require('../helpers/dbErrorHandler')
const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    type: process.env.MAIL_DRIVER,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secureConnection: process.env.MAIL_ENCRYPTION, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME, // generated ethereal user
        pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false, //force send with unauthorized
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
                <p>Please use the following link to reset your password</p>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr/>
                <p>This email may contain sentetive information</p>
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