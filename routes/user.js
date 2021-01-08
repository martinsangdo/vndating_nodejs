var express = require('express');
var router = express.Router();
var common = require('../common/common.js');
var Constant = require('../common/constant.js');
var User = require('../models/User.js');

//get latest users
router.get('/get_homepage_list', function(req, res, next) {
    //todo check auth
    var page_index = parseInt(req.query['page']);
    if (isNaN(page_index) || page_index <= 0){
        page_index = 1;
    }
    page_index = page_index - 1;     //query from 0

    var user = new User();
    user.countDocuments({is_active:{$ne:0}}, function(resp_total){
        user.search_by_condition({is_active:{$ne:0}}, {limit:Constant.DEFAULT_PAGE_LENGTH, skip: page_index * Constant.DEFAULT_PAGE_LENGTH},
            'Picture LookingFor Name Province Age Sex MariedStatus Objective updated_time', {'updated_time':-1}, function(resp){
                resp['total'] = resp_total.data;
                res.rest.success(resp);   //success
            });
    });

});

module.exports = router;
