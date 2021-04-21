const User = require("../models/User");
const { errorHandler } = require("../helpers/dbErrorHandler");
const jwt = require("jsonwebtoken"); //for genreate token
const expressJwt = require("express-jwt"); //for authorize token
const { sendEmailForgotPassword } = require("../helpers/emailHelper");
const _ = require("lodash");
const Constant = require("../common/constant");

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

      //generate a signed token
      const token = jwt.sign({ _id: doc._id }, process.env.JWT_SECRET);
      //persist the token as 't' in cookie with expiry date
      res.cookie("t", token, { expire: new Date() + 9999 });

      const { _id, Name, Email } = doc;
      return res.rest.success({
        data: { _id, Name, Email, token },
      });
    });
  });
};

exports.login = (req, res) => {
  const { Email, Password } = req.body;
  User.findOne({ Email }, (err, doc) => {
    if (err || !doc) {
      return res.rest.success("User not found");
    }
    //check password match
    if (!doc.authenticate(Password)) {
      return res.rest.success("Email and password is invalid");
    }

    //generate a signed token
    const token = jwt.sign({ _id: doc._id }, process.env.JWT_SECRET);
    //persist the token as 't' in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });

    const { _id, Name, Email } = doc;
    return res.rest.success({
      data: { _id, Name, Email, token },
    });
  });
};

exports.logout = (req, res) => {
  res.clearCookie("t");
  return res.rest.success();
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
    return res.rest.success("Unauthorize")
  }
  next();
};

exports.forgotPassword = (req, res) => {
  const { Email } = req.body;
  User.findOne({ Email }, async (err, doc) => {
    if (err || !doc) {
      return res.rest.success("Email not found")
    }
    const token = jwt.sign({ _id: doc._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: "10m",
    });
    doc.updateOne({ ResetPasswordToken: token }, (err, docUpdated) => {
      if (err) {
        return res.rest.success(err.message || err.msg)
      }
    });

    //send email activation
    const resEmail = await sendEmailForgotPassword({ token, Email });
    return res.rest.success({
      data: resEmail
    });
  });
};

exports.resetPassword = (req, res) => {
  const { ResetPasswordToken, Password: newPassword } = req.body;

  if (ResetPasswordToken) {
    jwt.verify(
      ResetPasswordToken,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          console.log("resetPassword", err);
          return res.rest.success("Token expired. Please try again")
        }

        User.findOne({ ResetPasswordToken }, (err, user) => {
          if (err || !user) {
            return res.rest.success(err.message || err.msg)
          }

          const updateData = {
            Password: newPassword,
            ResetPasswordToken: "",
          };

          user = _.extend(user, updateData);
          user.save((err, docSaved) => {
            if (err) {
              return res.rest.success(err.message || err.msg)
            }

            docSaved.Salt = undefined;
            docSaved.HashPassword = undefined;
            return res.rest.success({
              data: docSaved,
            });
          });
        });
      }
    );
  }
};
