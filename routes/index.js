var express = require('express');
var router = express.Router();
var Common = require('../common/common.js');
var Constant = require('../common/constant.js');
var User = require('../models/User.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});
//group by gender & objective

//group by gender & province

//group by gender & Looking for

//group by gender & marital status


module.exports = router;
