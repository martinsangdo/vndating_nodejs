/**
 * author: Martin
 * common functions are served in controllers & models
 */
var Constant = require('./constant.js');
var trim = require('trim');

//begin class

function Common() {
}

//=========
Common.prototype.xlog = function (mess, data) {
    if (console.log) {
        console.log(mess, data);
    }
};

Common.prototype.dlog = function (mess) {
    if (console.log) {
        console.log(mess);
    }
};

Common.prototype.isNull = function (a_var) {
    return a_var == null || a_var === undefined;
};

Common.prototype.trim = function (a_var) {
    if (a_var === undefined || a_var == null){
        return a_var;
    }
    if (typeof a_var == "string"){
        return trim(a_var);
    }
    return a_var;
};

Common.prototype.dlogJSON = function (mess) {
    if (!common.isEmpty(mess))		//avoid IE
        console.log(JSON.stringify(mess));
};
//used for string only
Common.prototype.isEmpty = function (a_var) {
    if (a_var === undefined || a_var == null || common.trim(a_var) == '')
        return true;
    return false;
};

Common.prototype.isStrictEmpty = function (a_var) {
    if (a_var == 'undefined' || a_var == 'null' || a_var === undefined || a_var == null || common.trim(a_var) == '')
        return true;
    return false;
};
//used for String only
Common.prototype.isNotEmpty = function (a_var) {
    return !common.isEmpty(a_var);
};

Common.prototype.isArray = function (something) {
    return Object.prototype.toString.call(something) === '[object Array]';
};

Common.prototype.get_obj_len = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * check if user logined or not
 * @param req
 */
Common.prototype.isNotLogined = function (req) {
    // return false;        //for testing
    // common.dlog('sess db: '+req.session[db_id]);
    // common.dlog('sess id: ' + req.session[Constant.SESSION.KEY_USER_ID]);
    return common.isEmpty(req.session[Constant.SESSION.KEY_USER_ID]);
};
/**
 * get id of logined user
 * @param req
 * @returns {*}
 */
Common.prototype.getLoginedUserId = function (req) {
    return req.session[Constant.SESSION.KEY_USER_ID];
};
/**
 * check if a & b is XOR empty (one of both is empty)
 */
Common.prototype.isXorEmpty = function (a, b) {
    return (common.isEmpty(a) && common.isNotEmpty(b)) || (common.isEmpty(b) && common.isNotEmpty(a));
};
/**
 * catch system db is down
 */
Common.prototype.removeArrayItem = function (arr, item) {
    for (var i = arr.length; i--;) {
        if (arr[i] === item) {
            arr.splice(i, 1);
        }
    }
};
//
Common.prototype.convert_obj_to_array = function(obj) {
    var arr_results = new Array();
    if (obj != null){
        Object.keys(obj).forEach(function(key){
            arr_results.push(obj[key]);
        });
    }
    return arr_results;
};
//convert object to array & return back to client
Common.prototype.reform_notif_response_format = function(res, obj_results){
    var arr_results = common.convert_obj_to_array(obj_results);
    res.rest.success({
        data: {list: arr_results}
    });
};
//remove duplicated item in array
Common.prototype.remove_duplicate_array_item = function(arr) {
    var obj = {};
    var len = arr.length;
    for (var i=0; i<len; i++){
        if (common.isEmpty(obj[arr[i]])){
            obj[arr[i]] = arr[i];
        }
    }
    return common.convert_obj_to_array(obj);
};
//
Common.prototype.get_timestamp = function() {
    return Math.floor(Date.now());
};
//
Common.prototype.get_created_time = function() {
    return Math.floor(Math.floor(Date.now())/1000);
};
//
Common.prototype.generateUniqueDeviceId = function() {
    return Constant.INVALID_DEVICE_PREFIX + common.get_timestamp() + '_' + Math.floor(Math.random()*1000000);
};
//
var common = new Common();
//
module.exports = Common;