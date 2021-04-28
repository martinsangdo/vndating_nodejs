/**
 * author: Martin
 * save user info
 */
//grab the things we need
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Constant = require("../common/constant.js");
const crypto = require("crypto");
const { v1: uuidv1 } = require("uuid");

//define format of Collection
var UserSchema = new Schema(
  {
    Id: { type: Number },
    IsBan: { type: Boolean },
    IsBadEmail: { type: Boolean },
    MariedStatus: { type: Number },
    IsConfirm: { type: Boolean },
    UpdatedDate: { type: String },
    Objective: { type: Number },
    IsSound: { type: Boolean },
    Height: { type: Number },
    Province: { type: Number },
    Picture: { type: String },
    YahooNick: { type: String },
    Degree: { type: Number },
    Phone: { type: String },
    Active: { type: Boolean },
    ShortDescription: { type: String },
    LookingFor: { type: String },
    Profile: { type: String },
    EncryptedPassword: { type: String },
    updated_time: { type: Number },
    CountryId: { type: Number },
    Name: { type: String },
    Click: { type: Number },
    DeleteReason: { type: String },
    Age: { type: Number },
    IsDirty: { type: Boolean },
    IsVip: { type: Boolean },
    Weight: { type: Number },
    Sex: { type: Number },
    LastLoginDate: { type: String },
    CreatedDate: { type: String },
    //own fields
    is_active: { type: Number, default: 1 },
    note: { type: String },
    created_time: { type: Number },
    Salt: String,
    Email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    HashPassword: {
      type: String,
      required: true,
    },
    ResetPasswordToken: {
      type: String,
    },
    SubscribeTimeLive: { type: Number, default: 0 },
    LastName: { type: String },
    FirstName: { type: String },
  },
  { collection: "user" }
);

//virtual field
UserSchema.virtual("Password")
  .set(function (Password) {
    this._password = Password;
    this.Salt = uuidv1();
    this.HashPassword = this.encryptPassword(Password);
  })
  .get(() => {
    return this._password;
  });

UserSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.HashPassword;
  },
  encryptPassword: function (Password) {
    if (!Password) return "";
    try {
      return crypto
        .createHmac("sha1", this.Salt)
        .update(Password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  comparePassword: function (Password) {
    if (!Password) return "";
    try {
      return (
        crypto.createHmac("sha1", this.Salt).update(Password).digest("hex") ===
        this.HashPassword
      );
    } catch (err) {
      return "";
    }
  },
};

//the schema is useless so far
//we need to create a model using it
var User = mongoose.model("User", UserSchema);
//
User.prototype.findOne = function (condition, fields, resp_func) {
  User.findOne(condition)
    .select(fields)
    .exec(function (err, res) {
      if (err) {
        var resp = {
          result: Constant.FAILED_CODE,
          message: Constant.SERVER_ERR,
          name: err.name,
          kind: err.kind,
        };
        resp_func(resp);
      } else {
        var resp = {
          result: Constant.OK_CODE,
          data: res,
        };
        resp_func(resp);
      }
    });
};
//
User.prototype.countDocuments = function (condition, resp_func) {
  User.countDocuments(condition, function (err, res) {
    if (err) {
      var resp = {
        result: Constant.FAILED_CODE,
        message: Constant.SERVER_ERR,
        name: err.name,
        kind: err.kind,
      };
      resp_func(resp);
    } else {
      var resp = {
        result: Constant.OK_CODE,
        data: res,
      };
      resp_func(resp);
    }
  });
};
//
User.prototype.search_by_condition = function (
  condition,
  paging,
  fields,
  sort,
  resp_func
) {
  User.find(condition)
    .limit(paging.limit)
    .skip(paging.skip)
    .select(fields)
    .sort(sort)
    .exec(function (err, res) {
      if (err) {
        var resp = {
          result: Constant.FAILED_CODE,
          message: Constant.SERVER_ERR,
          name: err.name,
          kind: err.kind,
        };
        resp_func(resp);
      } else {
        var resp = {
          result: Constant.OK_CODE,
          data: res,
          skip: paging.skip,
        };
        resp_func(resp);
      }
    });
};
//
User.prototype.getAllNoPaging = function (condition, resp_func) {
  User.find(condition).exec(function (err, res) {
    if (err) {
      var resp = {
        result: Constant.FAILED_CODE,
        message: Constant.SERVER_ERR,
        name: err.name,
        kind: err.kind,
      };
      resp_func(resp);
    } else {
      var resp = {
        result: Constant.OK_CODE,
        data: res,
      };
      resp_func(resp);
    }
  });
};
//create new document
User.prototype.create = function (data, resp_func) {
  var document = new User(data);
  document.save(function (err, result) {
    if (err) {
      var resp = {
        result: Constant.FAILED_CODE,
        message: Constant.SERVER_ERR,
        err: err,
      };
      resp_func(resp);
    } else {
      var resp = { result: Constant.OK_CODE, _id: result["_id"] };
      resp_func(resp);
    }
  });
};

module.exports = User;
