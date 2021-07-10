const express = require('express');
const router = express.Router();
const request = require('request');
var Common = require('../common/common.js');
const Constant = require('../common/constant.js');
var User = require("../models/User.js");

//scraping data
router.get('/scraping_henho', function(req, res) {
    var category = req.query["category"];
    var gender = req.query["gender"];
    var options = {
        uri: 'https://henho.top/Home/'+category+'?gender='+gender,
        method: 'GET',
        json:true
    };
    request(options, function(error, response, body){
        var num = 0;
        // console.log(body['Persons'])
        if (body != null && body['Persons'] != null){
            var raw_users = body['Persons'];
            num = raw_users.length;
            var user = new User();
            for (var i=0; i<num; i++){
                upsert_db(user, raw_users[i]);
            }
        }
        res.rest.success({num: num});
    });
});
//
function upsert_db(user, raw_user){
    // console.log(raw_user['Id']);
    var common = new Common();
    user.findOne( { Id: raw_user['Id']}, "Id", function (resp_detail) {
        if (resp_detail.data != null && resp_detail.data['Id'] != null){
            //existed in db, update something
            user.update({Id: raw_user['Id']}, {
                Picture: raw_user['Picture'],
                LookingFor: raw_user['LookingFor'],
                Profile: raw_user['Profile']
            }, function (resp_update) {
                // console.log(resp_update);
            });
        } else {
            //insert new document
            delete raw_user['IsBan'];
            delete raw_user['IsBadEmail'];
            delete raw_user['IsConfirm'];
            delete raw_user['UpdatedDate'];
            delete raw_user['IsSound'];
            delete raw_user['YahooNick'];
            delete raw_user['Active'];
            delete raw_user['ShortDescription'];
            delete raw_user['Click'];
            delete raw_user['IsDirty'];
            delete raw_user['IsVip'];
            delete raw_user['CreatedDate'];
            delete raw_user['LastLoginDate'];
            delete raw_user['EncryptedPassword'];
            raw_user['created_time'] = common.get_created_time();
            raw_user['updated_time'] = common.get_created_time();
            user.create(raw_user, function (resp_insert) {
                // console.log(resp_insert);
            });
        }
    });
}

module.exports = router;

