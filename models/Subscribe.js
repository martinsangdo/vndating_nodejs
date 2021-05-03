/**
 * author: Viet Ngo
 * save subscribe info
 */
//grab the things we need
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Constant = require("../common/constant.js");
const crypto = require("crypto");
const { v1: uuidv1 } = require("uuid");
const { ObjectId } = mongoose.Schema;

//define format of Collection
var SubscribeSchema = new Schema(
  {
    MCardVendor: { type: String, required: true },
    MCardAmount: {
      type: Number,
      required: true,
      maxlength: 32,
    },
    MCardCode: {
      type: String,
      required: true,
    },
      MCardSerial: {
          type: String,
          required: true,
      },
    MCardDuration: {
      type: Number,
      required: true,
      maxlength: 32,
    },
    IsActive: { type: Number, default: 1 },
    CreatedTime: { type: Number },
    User: { type: ObjectId, ref: "User" },
  },
  { collection: "subscribes" }
);

//the schema is useless so far
//we need to create a model using it
var Subscribe = mongoose.model("Subscribe", SubscribeSchema);
//
Subscribe.prototype.findOne = function (condition, fields, resp_func) {
  Subscribe.findOne(condition)
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
Subscribe.prototype.countDocuments = function (condition, resp_func) {
  Subscribe.countDocuments(condition, function (err, res) {
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
Subscribe.prototype.search_by_condition = function (
  condition,
  paging,
  fields,
  sort,
  resp_func
) {
  Subscribe.find(condition)
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
Subscribe.prototype.getAllNoPaging = function (condition, resp_func) {
  Subscribe.find(condition).exec(function (err, res) {
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
Subscribe.prototype.create = function (data, resp_func) {
  var document = new Subscribe(data);
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

module.exports = Subscribe;
