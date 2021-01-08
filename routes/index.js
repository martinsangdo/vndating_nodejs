var express = require('express');
var router = express.Router();
var Common = require('../common/common.js');
var Constant = require('../common/constant.js');
var Device = require('../models/Device.js');
var Movie = require('../models/Movie.js');
var Category = require('../models/Category.js');
var SeenMovie = require('../models/SeenMovie.js');
var Language = require('../models/Language.js');
var AppSetting = require('../models/AppSetting.js');
var DeviceMovieSpeed = require('../models/DeviceMovieSpeed.js');
var DeviceUser = require('../models/DeviceUser.js');
var User = require('../models/User.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});
//
module.exports = router;
