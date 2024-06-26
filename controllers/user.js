const User = require("../models/User");
const { errorHandler } = require("../helpers/dbErrorHandler");
const jwt = require("jsonwebtoken"); //for genreate token
const expressJwt = require("express-jwt"); //for authorize token
const { sendEmailForgotPassword } = require("../helpers/emailHelper");
const _ = require("lodash");
const Common = require("../common/common");
const common = new Common();

exports.signup = (req, res) => {
  const { LastName, FirstName, Email, Password } = req.body;
  //check email
  User.findOne({ Email }).exec(async (err, doc) => {
    if (doc) {
      return res.rest.success("Email đã được sử dụng!");
    }

    const Name = LastName + " " + FirstName;
    const created_time = common.get_created_time();
    const updated_time = common.get_created_time();
    const user = new User({
      LastName,
      FirstName,
      Name,
      Email,
      Password,
      created_time, updated_time
    });
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
  User.findOne({ Email, is_active: { $ne: 0 } }, (err, doc) => {
    if (err || !doc) {
      return res.rest.success(
        "Tài khoản này không tồn tại hoặc chưa kích hoạt!"
      );
    }
    //check password match
    if (!doc.authenticate(Password)) {
      return res.rest.success("Email hoặc mật khẩu không đúng!");
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

exports.requireLogin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  const isAuth = req.user && req.auth && req.user._id == req.auth._id;
  if (!isAuth) {
    return res.rest.success("Chưa đăng nhập!");
  }
  next();
};

exports.forgotPassword = (req, res) => {
  const { Email } = req.body;
  User.findOne({ Email }, async (err, doc) => {
    if (err || !doc) {
      return res.rest.success("Email không tồn tại");
    }
    const token = jwt.sign({ _id: doc._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: "10m",
    });
    doc.updateOne({ ResetPasswordToken: token }, (err, docUpdated) => {
      if (err) {
        return res.rest.success(err.message || err.msg);
      }
    });

    //send email activation
    const resEmail = await sendEmailForgotPassword({ token, Email });
    return res.rest.success({
      data: resEmail,
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
          return res.rest.success("Mã xác thực đã hết hạn!");
        }

        User.findOne({ ResetPasswordToken }, (err, user) => {
          if (err || !user) {
            return res.rest.success(err.message || err.msg);
          }

          const updateData = {
            Password: newPassword,
            ResetPasswordToken: "",
          };

          user = _.extend(user, updateData);
          user.save((err, docSaved) => {
            if (err) {
              return res.rest.success(err.message || err.msg);
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

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, doc) => {
    if (err || !doc) {
      return res.rest.success("userId không tồn tại!");
    }
    req.user = doc;
    next();
  });
};

exports.userByIdWithProfile = (req, res, next, id) => {
  User.findById(id).exec((err, doc) => {
    if (err || !doc) {
      req.user = null;
    } else {
      req.user = doc;
    }
    next();
  });
};

exports.profileById = (req, res, next, id) => {
  User.findById(id).exec((err, doc) => {
    if (err || !doc) {
      return res.rest.success("profileId không tồn tại!");
    }
    req.profile = doc;
    next();
  });
};

exports.profile = (req, res) => {
  const profile = req.profile;
  const user = req.user;
  let isHashEmail = false;
  if (!user) {
    isHashEmail = true;
  } else {
    //check SubscribeTimeLive
    const currentTime = new Date().getTime() / 1000;
    if (user.SubscribeTimeLive < currentTime) {
      isHashEmail = true;
    }
  }

  //do hash email
  if (isHashEmail) {
    var fullmail = profile.Email;
    var newmail = "";
    for (var i = 0; i < fullmail.length - 6; i++) {
      if (i % 2 == 0) {
        newmail += "*";
      } else {
        newmail += fullmail.substr(i, 1);
      }
    }
    profile.Email = newmail + fullmail.substr(fullmail.length - 6);
  }
  //replace special char http://localhost:3001/user/profile/5f65a34deb5bea0a257004c5

  const data = {
    Email: profile.Email,
    isHashEmail,
  };

  return res.rest.success({
    data,
  });
};

exports.read = (req, res) => {
  const user = req.user;
  user.Salt = undefined;
  user.HashPassword = undefined;
  return res.rest.success({
    data: user,
  });
};

exports.changePassword = (req, res) => {
  const params = req.body;
  const { Password, NewPassword } = params;
  const user = req.user;

  //check current password
  const isMatched = user.comparePassword(Password);
  if (!isMatched) {
    return res.rest.success("Mật khẩu hiện tại không đúng!");
  }

  user.Password = NewPassword;
  user.save((err, docSave) => {
    if (err) {
      return res.rest.success(errorHandler(err));
    }
    docSave.Salt = undefined;
    docSave.HashPassword = undefined;
    return res.rest.success({
      data: docSave,
    });
  });
};

exports.update = (req, res) => {
  let params = req.body;
  params.Name = params.LastName + " " + params.FirstName;
  params.updated_time = common.get_created_time();
  let user = req.user;
  user = _.extend(user, params);
  user.save((err, doc) => {
    if (err) {
      console.log('update err', errorHandler(err));
      return res.rest.success("Email đã tồn tại!");
    }
    doc.Salt = undefined;
    doc.HashPassword = undefined;
    return res.rest.success({
      data: doc,
    });
  });
};
