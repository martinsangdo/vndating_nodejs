
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

// var transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     logger: true,
//     debug: true,
//     auth: {
//         user: process.env.MAIL_USERNAME, // generated ethereal user
//         pass: process.env.MAIL_PASSWORD, // generated ethereal password
//     },
//     tls: {
//         rejectUnauthorized: false, //force send with unauthorized
//     }
// });

// var transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     logger: true,
//     debug: true,
//     auth: {
//       user: "mernshop3393@gmail.com",
//       pass: "mernshop@123"
//     }
//   });

exports.sendEmailForgotPassword = (params) => {
    const {token, Email} = params;
    return new Promise(resovle => {
        // send mail with defined transport object
        transporter.sendMail({
            from: process.env.FROM_EMAIL, // sender address
            to: [Email], // list of receivers
            subject: 'Email thay đổi mật khẩu',
            html: `
                <p>Click vào link bên dưới để đặt lại mật khẩu:</p>
                <a href="${process.env.CLIENT_URL}/user/reset_password/${token}">Đổi mật khẩu tại đây</a>
                <p>Hoặc copy đường link bên dưới và paste vào trình duyệt web:</p>
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
