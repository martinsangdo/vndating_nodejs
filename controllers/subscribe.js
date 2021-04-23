const Subscribe = require("../models/Subscribe");
const User = require("../models/User");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.create = (req, res) => {
  const params = req.body;
  const user = req.user;
  params.User = user;
  const subscribe = new Subscribe(params);
  subscribe.save((err, doc) => {
    if (err) {
      return res.rest.success(errorHandler(err));
    }

    //update user SubscribeTimeLive
      var currentDate = new Date();
      //extend by Duration
      currentDate.setDate(currentDate.getDate() + parseInt(params.MCardDuration));
      const currentSubscribeTimeLive = user.SubscribeTimeLive || 0
      //currentDate.getTime() is millisecond
      const newSubscribeTimeLive = currentSubscribeTimeLive + (currentDate.getTime() / 1000);
      user.SubscribeTimeLive = newSubscribeTimeLive
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
