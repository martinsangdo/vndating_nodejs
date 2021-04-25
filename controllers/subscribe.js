const Subscribe = require("../models/Subscribe");
const User = require("../models/User");
const { errorHandler } = require("../helpers/dbErrorHandler");
const Common = require("../common/common");
const common = new Common();
var Constant = require("../common/constant.js");

exports.create = (req, res) => {
  const params = req.body;
  const user = req.user;
  params.User = user;
  //check email
  Subscribe.findOne({ MCardCode: params.MCardCode }).exec(async (err, doc) => {
    if (doc) {
      return res.rest.success("Code is taken");
    }
    params.CreatedTime = common.get_created_time();
    const subscribe = new Subscribe(params);
    subscribe.save((err, doc) => {
      if (err) {
        return res.rest.success(errorHandler(err));
      }

      //update user SubscribeTimeLive
      //extend by Duration
      var currentDate = new Date();
      currentDate.setDate(
        currentDate.getDate() + parseInt(params.MCardDuration)
      );
      const currentSubscribeTimeLive = user.SubscribeTimeLive || 0;
      //currentDate.getTime() is millisecond
      const newSubscribeTimeLive =
        currentSubscribeTimeLive + currentDate.getTime() / 1000;
      user.SubscribeTimeLive = newSubscribeTimeLive;
      user.save((err, docSave) => {
        if (err) {
          return res.json({
            status: 0,
            data: errorHandler(err),
          });
        }
        return res.rest.success({
          data: { ...doc, newSubscribeTimeLive },
        });
      });
    });
  });
};

exports.subscribeById = (req, res, next, id) => {
  Subscribe.findById(id).exec((err, doc) => {
    if (err || !doc) {
      return res.rest.success("Subscribe not found");
    }
    req.subscribe = doc;
    next();
  });
};

exports.read = (req, res) => {
  const subscribe = req.subscribe;

  return res.rest.success({
    data: subscribe,
  });
};

exports.list = (req, res) => {
  var pageIndex = parseInt(req.query["page"]);
  if (isNaN(pageIndex) || pageIndex <= 0) {
    pageIndex = 1;
  }
  pageIndex = pageIndex - 1; //query from 0

  var subscribe = new Subscribe();
  var conditions = {
    IsActive: { $ne: 0 },
    User: req.user,
  };
  subscribe.countDocuments(conditions, function (resp_total) {
    subscribe.search_by_condition(
      conditions,
      {
        limit: Constant.DEFAULT_PAGE_LENGTH,
        skip: pageIndex * Constant.DEFAULT_PAGE_LENGTH,
      },
      "",
      { _id: -1 },
      function (resp) {
        resp["total"] = resp_total.data;
        res.rest.success(resp); //success
      }
    );
  });
};
