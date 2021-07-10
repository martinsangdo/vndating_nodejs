var express = require('express');
var router = express.Router();
var Common = require('../../common/common.js');
var Constant = require('../../common/constant.js');
var User = require("../../models/User.js");
//show movie list with pagination
router.get('/new-user-list', function(req, res) {
    res.render('admin/new_user_list');
});
//called by javascript
router.get('/new-user-list-query', function(req, res) {
    var user = new User();
    // var common = new Common();
    // var currentTime = common.get_created_time();
    var condition = {Salt: {$ne:null}, SubscribeTimeLive:{$gt:0}};  //in 1 month
    user.search_by_condition(condition,  //scrape documents
        {limit:50, skip:0},
        'Name SubscribeTimeLive created_time',
        {created_time:-1}, function(resp){
            res.rest.success(resp.data);
        });
});

//
module.exports = router;
