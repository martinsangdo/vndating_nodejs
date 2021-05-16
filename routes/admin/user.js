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
    user.search_by_condition({IsDirty: null, IsVip: null},  //scrape documents
        {limit:50, skip:0},
        'Name Email created_time',
        {created_time:-1}, function(resp){
            res.rest.success(resp.data);
        });
});

//
module.exports = router;
