const User = require("../models/User");
const { errorHandler } = require("../helpers/dbErrorHandler");
const jwt = require("jsonwebtoken"); //for genreate token
const expressJwt = require("express-jwt"); //for authorize token
const { sendEmailForgotPassword } = require("../helpers/emailHelper");
const _ = require("lodash");

exports.signup = (req, res) => {
  const { Name, Email, Password } = req.body;
  //check email
  User.findOne({ Email }).exec(async (err, doc) => {
    if (doc) {
      return res.rest.success("Email is taken");
    }

    const user = new User({ Name, Email, Password });
    user.save((err, doc) => {
      if (err) {
        return res.rest.success(errorHandler(err));
      }
      doc.salt = undefined;
      doc.hashPassword = undefined;
      return res.rest.success(doc);
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }, (err, doc) => {
    if (err || !doc) {
      return res.json({
        status: 0,
        data: "User not found",
      });
    }
    //check password match
    if (!doc.authenticate(password)) {
      return res.json({
        status: 0,
        data: "Email and password is invalid",
      });
    }

    //generate a signed token
    const token = jwt.sign({ _id: doc._id }, process.env.JWT_SECRET);
    //persist the token as 't' in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });

    const { _id, name, email, role } = doc;
    res.json({
      status: 1,
      data: { _id, name, email, role, token },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({
    status: 1,
  });
};

// exports.requireLogin = expressJwt({
//   secret: process.env.JWT_SECRET,
//   userProperty: "auth",
// });

exports.isAuth = (req, res, next) => {
  const isAuth = req.user && req.auth && req.user._id == req.auth._id;
  console.log("req.user", req.user._id);
  console.log("req.auth", req.auth._id);
  console.log("req.user._id == req.auth._id", req.user._id == req.auth._id);
  console.log("isAuth", isAuth);
  if (!isAuth) {
    return res.json({
      status: 0,
      data: "Unauthorize",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role === 0) {
    return res.json({
      status: 0,
      data: "Admin resources - Access denied",
    });
  }
  next();
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  User.findOne({ email }, async (err, doc) => {
    if (err || !doc) {
      return res.json({
        status: 0,
        data: "Email not found",
      });
    }
    const token = jwt.sign({ _id: doc._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: "10m",
    });
    doc.updateOne({ resetPasswordToken: token }, (err, docUpdated) => {
      if (err) {
        return res.json({
          status: 0,
          data: err.message || err.msg,
        });
      }
    });

    //send email activation
    const resEmail = await sendEmailForgotPassword({ token, email });
    res.json(resEmail);
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordToken, newPassword } = req.body;

  if (resetPasswordToken) {
    jwt.verify(
      resetPasswordToken,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          console.log("resetPassword", err);
          return res.json({
            status: 0,
            data: "resetPassword err",
          });
        }

        User.findOne({ resetPasswordToken }, (err, user) => {
          if (err || !user) {
            return res.json({
              status: 0,
              data: err.message || err.msg,
            });
          }

          const updateData = {
            password: newPassword,
            resetPasswordToken: "",
          };

          user = _.extend(user, updateData);
          user.save((err, docSaved) => {
            if (err) {
              return res.json({
                status: 0,
                data: err.message || err.msg,
              });
            }

            docSaved.salt = undefined;
            docSaved.hashPassword = undefined;
            res.json({
              status: 1,
              data: docSaved,
            });
          });
        });
      }
    );
  }
};
