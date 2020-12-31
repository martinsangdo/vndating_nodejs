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
//get all language
router.get('/language-codes', function(req, res) {
    var lang_code = req.query['lang_code'];
    var common = new Common();
    if (common.isEmpty(lang_code)){
        lang_code = 'en';   //default english
    }

});
//get next movie for desktop app, called when user swipes left/right or opens app
/*
params: device_code / category_id / is_load_app / seen_movie_ids
 */
router.get('/app-next-movie', function(req, res) {
    var common = new Common();
    var seen_movie_ids = req.query['seen_movie_ids']; //must include movies being in playlist
    if (common.isEmpty(seen_movie_ids)){
        seen_movie_ids = [];
    } else {
        seen_movie_ids = seen_movie_ids.split(',');
    }
    var device_code = req.query['device_code'];
    var user_id = req.query['user_id'];
    var category_id = req.query['category_id'];
    var is_load_app = req.query['is_load_app']; //1: user opens app
    is_load_app = parseInt(is_load_app);
    // console.log('seen_movie_ids', seen_movie_ids);
    // console.log('category_id', category_id);
    var category = new Category();
    if (is_load_app > 0){
        //user opens app, get saved movies, if any
        get_saved_movies(device_code, user_id, function(watched_movies){
            //get latest categories
            category.search_by_condition({is_active: 1}, {limit:20, skip:0},
                '_id name language_key index', {index:1}, function (resp_cat_list) {
                    if (common.isEmpty(category_id)){
                        category_id = resp_cat_list.data[0]['_id'];     //get default
                    }
                    var language = new Language();
                    language.getAllNoPaging({is_active: 1}, function (resp_language) {
                        var appSetting = new AppSetting();
                        appSetting.findOne({key:"desktop_app"}, function (resp_app_setting) {
                            getLatestMovieOfDevice(device_code, category_id, seen_movie_ids, function(response){
                                response['categories'] = resp_cat_list.data;
                                response['lang_data'] = resp_language.data;
                                response['app_setting'] = resp_app_setting.data;
                                response['watched_movies'] = watched_movies;
                                res.rest.success(response);
                            });
                        });
                    });
                });
        });
    } else {
        if (category_id == null || category_id == ''){
            //need to get default category
            category.findOne({index: 1}, function (default_cat) {
                if (default_cat.result == Constant.OK_CODE) {
                    if (default_cat.data != null && default_cat.data['_id'] != null) {
                        category_id = default_cat.data['_id'];
                    }
                }
                //just get next movie
                getLatestMovieOfDevice(device_code, category_id, seen_movie_ids, function(response){
                    res.rest.success(response);
                });
            });
        } else {
            getLatestMovieOfDevice(device_code, category_id, seen_movie_ids, function(response){
                res.rest.success(response);
            });
        }
    }
});
//clear seen movies of device (for testing)
router.delete('/clear-listing-order', function(req, res) {
    var device_code = req.query['device_code'];
    var device = new Device();
    var common = new Common();

    device.findOne({device_code: device_code}, function(resp_detail) {
        if (resp_detail.result == Constant.OK_CODE && common.isNotEmpty(resp_detail.data)) {
            var device_db_id = resp_detail.data['_id'];
            //clear watching movies in this device
            var deviceUser = new DeviceUser();
            deviceUser.update({device_id: device_db_id}, {watching_movies: []}, function(){});
            var seenMovie = new SeenMovie();
            seenMovie.getAllNoPaging({device_id: device_db_id}, function(resp_detail_seen) {
                if (resp_detail_seen.result == Constant.OK_CODE) {
                    if (resp_detail_seen.data != null && resp_detail_seen.data.length > 0) {
                        for (var i=0; i<resp_detail_seen.data.length; i++){
                            clear_seen_movie(resp_detail_seen.data[i]['_id'], [], function(){
                            });
                        }
                        res.rest.success();
                    } else {
                        //device not seen any movie, do nothing
                        res.rest.success();
                    }
                } else {
                    //device not seen any movie, do nothing
                    res.rest.success();
                }
            });
        } else {
            //device not found
            res.rest.success();
        }
    });
});
//save speed of device & movie
router.post('/device-movie-speed', function(req, res) {
    var device_code = req.body['device_code'];
    var movie_id = req.body['movie_id'];
    var list = req.body['list'];    //speed list
    var device = new Device();
    var common = new Common();

    device.findOne({device_code: device_code}, function(resp_detail_device) {
        if (resp_detail_device.result == Constant.OK_CODE && common.isNotEmpty(resp_detail_device.data)) {
            var device_db_id = resp_detail_device.data['_id'];
            var deviceMovieSpeed = new DeviceMovieSpeed();
            deviceMovieSpeed.findOne({device_id: device_db_id, movie_id: movie_id}, function(resp_detail){
                if (resp_detail.result == Constant.OK_CODE){
                    if (resp_detail.data != null && resp_detail.data['_id'] != null){
                        deviceMovieSpeed.update({_id: resp_detail.data['_id']}, {downloadSpeed: list}, function(resp_update){
                            reset_processed_speed(movie_id, function(){});
                            res.rest.success();
                        });
                    } else {
                        //not found
                        deviceMovieSpeed.create({device_id: device_db_id, movie_id: movie_id, downloadSpeed: list}, function(resp_update){
                            reset_processed_speed(movie_id, function(){});
                            res.rest.success();
                        });
                    }
                } else {
                    //something wrong
                    res.rest.success();
                }
            });
        } else {
            //device not found
            res.rest.success();
        }
    });
});
//save watching movies of device & user
router.post('/save-device-movie-playlist', function(req, res) {
    var device_code = req.body['device_code'];
    var user_id = req.body['user_id'];
    var watching_movies = req.body['watching_movies'];
    var common = new Common();

    if (common.isEmpty(device_code)){
        res.rest.success({data: {message: Constant.MISMATCH_PARAMS}});
    } else {
        if (watching_movies === undefined || watching_movies.length == 0){
            watching_movies = [];      //clear data
        }
        var user = new User();
        //check existed user
        if (common.isEmpty(user_id)){
            //trial user, need to create 1 trial user for this device (name & email is device code)
            user.findOne({email:device_code}, function(existed_user){
                upsert_user_device(watching_movies, device_code, user_id, existed_user, function (result) {
                    res.rest.success(result);
                });
            });
        } else {
            //check whether user id is valid
            user.findOne({_id:user_id}, function(existed_user){
                upsert_user_device(watching_movies, device_code, user_id, existed_user, function (result) {
                    res.rest.success(result);
                });
            });
        }
    }
});
//==========
function get_saved_movies(device_code, user_id, callback){
    var device = new Device();
    var common = new Common();
    var deviceUser = new DeviceUser();
    device.findOne({device_code: device_code}, function(resp_detail_device) {
        if (resp_detail_device.result == Constant.OK_CODE && common.isNotEmpty(resp_detail_device.data)) {
            //device existed
            var device_db_id = resp_detail_device.data['_id'];
            //check existed user
            var user = new User();
            if (common.isEmpty(user_id)){
                //find trial user
                user.findOne({email:device_code}, function(existed_user){
                    if (existed_user.result == Constant.OK_CODE && common.isNotEmpty(existed_user.data)){
                        user_id = existed_user.data['_id'];
                        deviceUser.findOne({device_id: device_db_id, user_id: user_id}, function(resp_detail){
                            if (resp_detail.result == Constant.OK_CODE){
                                if (resp_detail.data['watching_movies'] != null){
                                    callback(resp_detail.data['watching_movies']);
                                } else {
                                    callback([]);
                                }
                            } else {
                                callback([]);
                            }
                        });
                    } else {
                        //user not found, never saved watched movies
                        callback([]);
                    }
                });
            } else {
                //check whether user id is valid
                user.findOne({_id:user_id}, function(existed_user){
                    if (existed_user.result == Constant.OK_CODE && common.isNotEmpty(existed_user.data)){
                        user_id = existed_user.data['_id'];
                        deviceUser.findOne({device_id: device_db_id, user_id: user_id}, function(resp_detail){
                            if (resp_detail.result == Constant.OK_CODE){
                                if (resp_detail.data['watching_movies'] != null){
                                    callback(resp_detail.data['watching_movies']);
                                } else {
                                    callback([]);
                                }
                            } else {
                                callback([]);
                            }
                        });
                    } else {
                        //user not found, never saved watched movies
                        callback([]);
                    }
                });
            }
        } else {
            //device not found, never saved watched movies
            callback([]);
        }
    });
}
//
function upsert_user_device(watching_movies, device_code, user_id, existed_user, callback){
    var common = new Common();

    if (existed_user.result == Constant.OK_CODE && common.isNotEmpty(existed_user.data)){
        //existed user
        user_id = existed_user.data['_id'];
        upsert_device_playlist(watching_movies, device_code, user_id, function(result){
            callback(result);
        });
    } else {
        //need to create new user document
        createNewUser(device_code, function(result){
            if (result.result == Constant.OK_CODE && common.isNotEmpty(result._id)){
                user_id = result._id;
                upsert_device_playlist(watching_movies, device_code, user_id, function(result){
                    callback(result);
                });
            } else {
                //something wrong with server, cannot create new user
                callback({data: {message: Constant.SERVER_ERR}});
            }
        });
    }
}
//
function upsert_device_playlist(watching_movies, device_code, user_id, callback){
    var device = new Device();
    var common = new Common();
    var deviceUser = new DeviceUser();

    device.findOne({device_code: device_code}, function(resp_detail_device) {
        if (resp_detail_device.result == Constant.OK_CODE && common.isNotEmpty(resp_detail_device.data)) {
            //device existed
            var device_db_id = resp_detail_device.data['_id'];
            deviceUser.findOne({device_id: device_db_id, user_id: user_id}, function(resp_detail){
                if (resp_detail.result == Constant.OK_CODE){
                    if (resp_detail.data != null && resp_detail.data['_id'] != null){
                        deviceUser.update({_id: resp_detail.data['_id']}, {watching_movies: watching_movies}, function(resp_update){
                            callback(resp_update);
                        });
                    } else {
                        //not found
                        deviceUser.create({device_id: device_db_id, user_id: user_id, watching_movies: watching_movies}, function(resp_update){
                            callback(resp_update);
                        });
                    }
                } else {
                    //something wrong
                    callback({data: {message: Constant.SERVER_ERR}});
                }
            });
        } else {
            //device not found, need to create one
            device.create({device_code: device_code, created_time: common.get_created_time()}, function (resp_create) {
                if (resp_create.result == Constant.OK_CODE && common.isNotEmpty(resp_create._id)){
                    var device_db_id = resp_create['_id'];
                    deviceUser.create({device_id: device_db_id, user_id: user_id, watching_movies: watching_movies}, function(resp_update){
                        callback(resp_update);
                    });
                } else {
                    //failed to log this device
                    callback({data: {message: Constant.SERVER_ERR}});
                }
            });
        }
    });
}
//create a new trial user for this device
function createNewUser(device_code, callback){
    var common = new Common();
    var new_data = {
        full_name: device_code,
        email: device_code,
        created_time: common.get_created_time(),
        is_active: 1
    };
    var user = new User();
    user.create(new_data, callback);
}
//
function getLatestMovieOfDevice(device_code, category_id, seen_movie_ids, callback) {
    var common = new Common();
    if (common.isEmpty(device_code)){
        //generate random id
        device_code = common.generateUniqueDeviceId();
    }
    var active_condition = {};     //active only
    if (common.isNotEmpty(category_id) && category_id != 'undefined'){
        active_condition['category_id'] = category_id;
    }
//check if device was registered in system
    var device = new Device();
    device.findOne({device_code: device_code}, function(resp_detail){
        if (resp_detail.result == Constant.OK_CODE && common.isNotEmpty(resp_detail.data)){
            //existed, find latest active movie which never seen before
            var seenMovie = new SeenMovie();
            var device_db_id = resp_detail.data['_id'];
            seenMovie.findOne({device_id: device_db_id, category_id: category_id}, function(resp_detail_seen){
                var seen_movie_list = [];
                var document_id = '';
                if (resp_detail_seen.result == Constant.OK_CODE){
                    if (resp_detail_seen.data != null && resp_detail_seen.data['list'] != null){
                        seen_movie_list = resp_detail_seen.data['list'];
                        document_id = resp_detail_seen.data['_id'];
                    }
                    if (seen_movie_ids.length > 0){
                        seen_movie_list = seen_movie_list.concat(seen_movie_ids);
                        seen_movie_list = common.remove_duplicate_array_item(seen_movie_list);
                    }
                    if (seen_movie_list.length > 0){
                        active_condition['_id'] = {$nin:seen_movie_list};    //dismiss seen movies
                    }
                }
                get1LatestMovie(active_condition, function(latest_list){
                    //load again if no list
                    if (latest_list == null || latest_list.length == 0){
                        //clear seen movie
                        clear_seen_movie(document_id, seen_movie_ids, function(){
                            active_condition = {};
                            if (seen_movie_ids.length > 0){
                                active_condition['_id'] = {$nin:seen_movie_ids};    //dismiss seen movies
                            }
                            if (common.isNotEmpty(category_id) && category_id != 'undefined'){
                                active_condition['category_id'] = category_id;
                            }
                            // not sure why const not working here
                            get1LatestMovie(active_condition, function(new_list){
                                callback({list: new_list});
                            });
                        });
                    } else if (seen_movie_list.length > 0){
                        upsert_seen_movie(document_id, seen_movie_list, device_db_id, category_id, function(){
                            callback({list: latest_list});
                        });
                    } else {
                        callback({list: latest_list});
                    }
                });
            });
        } else {
            //not existed
            device.create({device_code: device_code, created_time: common.get_created_time()}, function (resp_create) {
                if (resp_create.result == Constant.OK_CODE && common.isNotEmpty(resp_create._id)){
                    get1LatestMovie(active_condition, function(latest_list){
                        //load again if no list
                        if (latest_list == null || latest_list.length == 0){
                            //clear seen movie
                            clear_seen_movie('', function(){
                                if (common.isNotEmpty(category_id) && category_id != 'undefined'){
                                    active_condition['category_id'] = category_id;
                                }
                                get1LatestMovie(active_condition, function(new_list){
                                    callback({list: new_list});
                                });
                            });
                        } else {
                            callback({list: latest_list});
                        }
                    });
                } else {
                    //failed to log this device
                    callback({message: Constant.SERVER_ERR});
                }
            });
        }
    });
}
//
function get1LatestMovie(condition, callback){
    condition['is_active'] = 1;
    condition['play_links'] = {$exists: true, $ne: []};
    var movie = new Movie();
    //get 1 latest active movie
    // console.log('get1LatestMovie', condition);
    movie.search_by_condition(condition, {limit:1, skip: 0},
        '_id title description thumbnail cover_url play_links category_id size thumb_pics', {created_time: -1}, function(resp_list){
        if (resp_list.result == Constant.OK_CODE){
            callback(resp_list.data);
        } else {
            callback([]);
        }
    });
}
//upsert seen movie
function upsert_seen_movie(document_id, seen_movie_list, device_db_id, category_id, callback){
    var seenMovie = new SeenMovie();
    if (document_id == null || document_id == ''){
        //insert
        seenMovie.create({
            device_id: device_db_id,
            category_id: category_id,
            list: seen_movie_list
        }, callback);
    } else {
        //update
        seenMovie.update({_id: document_id}, {
            list: seen_movie_list
        }, callback);
    }
}
//
function clear_seen_movie(document_id, remain_seen_ids, callback){
    if (document_id == null || document_id == ''){
        callback();
    }
    var seenMovie = new SeenMovie();
    seenMovie.update({_id: document_id}, {
        list: remain_seen_ids
    }, callback);
}
//because speed of this movie is changed, need to put it back
function reset_processed_speed(movie_id, callback){
    var movie = new Movie();
    movie.update({_id: movie_id}, {is_processed_speed: 0}, callback);
}
//
module.exports = router;
