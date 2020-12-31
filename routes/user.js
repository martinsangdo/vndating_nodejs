var express = require('express');
var router = express.Router();
var common = require('../common/common.js');
var Constant = require('../common/constant.js');
var User = require('../models/User.js');

//get latest users
router.get('/paging-list', function(req, res, next) {
    var page_index = parseInt(req.query['page']);
    if (isNaN(page_index) || page_index <= 0){
        page_index = 1;
    }
    page_index = page_index - 1;     //query from 0

    var user = new User();
    user.search_by_condition({is_active:{$ne:0}}, {limit:Constant.DEFAULT_PAGE_LENGTH, skip: page_index * Constant.DEFAULT_PAGE_LENGTH}, '', 'updated_time', function(resp){
        res.rest.success({result: resp});   //success
    });
});

module.exports = router;
