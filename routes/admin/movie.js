var express = require('express');
var router = express.Router();
var Common = require('../../common/common.js');
var Constant = require('../../common/constant.js');
var Movie = require('../../models/Movie.js');
var Category = require('../../models/Category.js');
var DeviceMovieSpeed = require('../../models/DeviceMovieSpeed.js');
//show movie list with pagination
router.get('/list', function(req, res) {
    var common = new Common();
    if (common.isEmpty(req.session[Constant.SESSION.KEY_USER_ID])){
        res.redirect('/admin-control/login');
        return;
    }
    res.render('admin/movie_list', {username: req.session[Constant.SESSION.KEY_USER_ID]});
});

router.get('/detail', function(req, res) {
    var common = new Common();
    if (common.isEmpty(req.session[Constant.SESSION.KEY_USER_ID])){
        res.redirect('/admin-control/login');
        return;
    }
    res.render('admin/movie_detail', {username: req.session[Constant.SESSION.KEY_USER_ID]});
});

//========== AJAX CALL
router.get('/paging-list', function(req, res) {
    //get page index
    var page_index = parseInt(req.query['page']);
    if (isNaN(page_index) || page_index <= 0){
        page_index = 1;
    }
    page_index = page_index - 1;     //query from 0
    var category_id = req.query['cat_id'];
    var keyword = req.query['keyword'];
    var status = req.query['status'];
    var min_speed = req.query['min_speed'];
    var max_speed = req.query['max_speed'];

    //search movies
    var movie = new Movie();
    var condition = {};
    var common = new Common();
    if (common.isNotEmpty(category_id)){
        condition['category_id'] = category_id;
    }
    if (common.isNotEmpty(keyword)){
        //search in code / title / description / note
        condition['$or'] = [{description: { $regex: keyword, $options: "i" }}, {title: { $regex: keyword, $options: "i" }},
            {code: { $regex: keyword, $options: "i" }},{note: { $regex: keyword, $options: "i" }}];
    }
    if (common.isNotEmpty(status)){
        if (parseInt(status) == 0){
            //inactive
            condition['is_active'] = 0;
        } else if (parseInt(status) == 1){
            //active
            condition['is_active'] = 1;
        }
    }
    if (min_speed != null && max_speed != null){
        condition['$and'] = [{speed:{$gt:min_speed*1000}},{speed:{$lt:max_speed*1000}}];
    }
    //get total movies
    // console.log(condition);
    movie.countDocuments(condition, function (res_total) {
        var show_data = [];
        var total = 0;
        if (res_total.result == Constant.OK_CODE){
            total = res_total.data;
            //get categories
            var category = new Category();
            category.getAllNoPaging({}, function(resp_category){
                var category_map = {};  //key: cat id, value: name
                if (resp_category.result == Constant.OK_CODE){
                    for (var i=0; i<resp_category.data.length; i++){
                        category_map[resp_category.data[i]['_id']] = resp_category.data[i]['name'];
                    }
                }
                //get movies by pagination
                movie.search_by_condition(condition, {limit:Constant.DEFAULT_PAGE_LENGTH, skip: page_index * Constant.DEFAULT_PAGE_LENGTH},
                    '_id title description thumbnail cover_url play_links category_id is_active note size thumb_pics speed', {created_time: -1}, function(list){
                        if (list.result == Constant.OK_CODE) {
                            for (var i = 0; i < list.data.length; i++) {
                                if (common.isNotEmpty(category_map[list.data[i]['category_id']])){
                                    list.data[i]['category_name'] = category_map[list.data[i]['category_id']];
                                }
                                show_data.push(list.data[i]);
                            }
                        }
                        res.rest.success({list: show_data, total: total, categories: resp_category.data});   //success
                    });
            });
        } else {
            res.rest.success({list: show_data, total: total});   //success
        }

    });
});
//save basic detail
router.post('/save-basic-detail', function(req, res) {
    var id = req.body['id'];
    var description = req.body['description'];
    var note = req.body['note'];
    var category_id = req.body['data_category'];
    var magnet_link = req.body['magnet_link'];
    //search movie by id
    var movie = new Movie();
    movie.findOne({_id: id}, function(resp_detail){
        if (resp_detail.result == Constant.OK_CODE){
            var detail = resp_detail.data;
            var play_links = detail['play_links'];
            var common = new Common();
            if (common.isEmpty(play_links)){
                play_links = [];
            }
            //do not add duplicated link
            if (play_links.length > 0){
                //remove the link
                play_links = play_links.filter(item => item != magnet_link);
            }
            play_links.push(magnet_link);    //to make sure latest link at the end
            //save back
            movie.update({_id: id}, {play_links: play_links, description: description,
                    note: note, category_id: category_id}, function(resp_update){
                if (resp_update.result == Constant.OK_CODE){
                    res.rest.success({data: Constant.OK_CODE});
                } else {
                    res.rest.success({data: {message: Constant.SERVER_ERR}});
                }
            });
        } else {
            //not found
            res.rest.success({data: {message: Constant.NOT_FOUND}});
        }
    });
});
//save extra detail
router.post('/save-extra-detail', function(req, res) {
    var id = req.body['id'];
    //search movie by id
    var movie = new Movie();
    movie.findOne({_id: id}, function(resp_detail){
        if (resp_detail.result == Constant.OK_CODE){
            var detail = resp_detail.data;
            //save back
            movie.update({_id: id}, {title: req.body['title'], thumbnail: req.body['thumbnail'],
                cover_url: req.body['cover_url'], size: req.body['size']}, function(resp_update){
                if (resp_update.result == Constant.OK_CODE){
                    res.rest.success({data: Constant.OK_CODE});
                } else {
                    res.rest.success({data: {message: Constant.SERVER_ERR}});
                }
            });
        } else {
            //not found
            res.rest.success({data: {message: Constant.NOT_FOUND}});
        }
    });
});
//get movie detail
router.get('/movie-detail', function(req, res) {
    var movie_id = req.query['id'];
    if (movie_id.length == 0){
        //invalid movie id
        res.rest.success({data: {message: Constant.NOT_FOUND}});
    }
    //search movies
    var movie = new Movie();
    var condition = {_id:movie_id};
    //get categories
    var category = new Category();
    category.getAllNoPaging({is_active:1}, function(resp_category) {
        var category_map = {};  //key: cat id, value: name
        if (resp_category.result == Constant.OK_CODE) {
            for (var i = 0; i < resp_category.data.length; i++) {
                category_map[resp_category.data[i]['_id']] = resp_category.data[i]['name'];
            }
        }
        movie.findOne(condition, function (resp_detail) {
            res.rest.success({data: resp_detail.data, categories: resp_category.data});
        });
    });
});
//soft delete movie(s)
router.post('/delete-movies', function(req, res) {
    var ids = JSON.parse(req.body['ids']);
    var is_active = req.body['is_active'];
    // console.log(ids);
    if (ids == null || ids.length == 0){
        res.rest.success({data: Constant.OK_CODE});
        return;
    }
    var condition = {_id: {$in: ids}};
    var movie = new Movie();
    movie.update(condition, {is_active: parseInt(is_active)}, function(resp_update){
        // console.log(resp_update);
        if (resp_update.result == Constant.OK_CODE){
            res.rest.success({data: Constant.OK_CODE});
        } else {
            res.rest.success({data: {message: Constant.SERVER_ERR}});
        }
    });
});
//upsert movie
router.post('/upsert-movie', function(req, res) {
    var movie_id = req.body['movie_id'];
    var data = {
        code : req.body['code'],
        title : req.body['title'],
        thumbnail : req.body['thumbnail'],
        cover_url : req.body['cover'],
        size : req.body['size'],
        speed : req.body['speed'],
        note : req.body['note'],
        category_id: req.body['category_id']
    };
    var magnet_link = req.body['magnet_link'];
    var movie = new Movie();
    if (movie_id == ''){
        //create new, need to find if code or magnet link is duplicated
        movie.findOne({code: data['code']}, function(resp_detail){
            if (resp_detail.result == Constant.OK_CODE && resp_detail.data != null && resp_detail.data['code'] != ''){
                res.rest.success({data: {message: Constant.DUPLICATE_CODE}});
            } else {
                //not found, mean code is valid
                movie.findOne({play_links: [magnet_link]}, function(resp_detail){
                    if (resp_detail.result == Constant.OK_CODE && resp_detail.data != null && resp_detail.data['code'] != ''){
                        res.rest.success({data: {message: Constant.DUPLICATE_MAGNET_LINK}});
                    } else {
                        //not found, mean magnet link is valid
                        data['play_links'] = [magnet_link];
                        data['is_active'] = 1;
                        data['is_processed_speed'] = 0;
                        movie.create(data, function(resp_create){
                            res.rest.success({data: resp_create});
                        });
                    }
                });
            }
        });
    } else {
        //update
        movie.findOne({_id: movie_id}, function(resp_existing_detail){
            if (resp_existing_detail.result == Constant.OK_CODE){
                //found one
                movie.findOne({code: data['code'], _id: {$ne: movie_id}}, function(resp_detail){
                    if (resp_detail.result == Constant.OK_CODE && resp_detail.data != null && resp_detail.data['code'] != ''){
                        res.rest.success({data: {message: Constant.DUPLICATE_CODE}});
                    } else {
                        //not found, mean code is valid
                        movie.findOne({play_links: [magnet_link], _id: {$ne: movie_id}}, function(resp_detail){
                            if (resp_detail.result == Constant.OK_CODE && resp_detail.data != null && resp_detail.data['code'] != ''){
                                res.rest.success({data: {message: Constant.DUPLICATE_MAGNET_LINK}});
                            } else {
                                //not found, mean magnet link is valid
                                var detail = resp_existing_detail.data;
                                var play_links = detail['play_links'];
                                var common = new Common();
                                if (common.isEmpty(play_links)){
                                    play_links = [];
                                }
                                //do not add duplicated link
                                if (play_links.length > 0){
                                    //remove the link
                                    play_links = play_links.filter(item => item != magnet_link);
                                }
                                play_links.push(magnet_link);    //to make sure latest link at the end
                                data['play_links'] = play_links;
                                movie.update({_id: movie_id}, data, function(resp_update){
                                    res.rest.success({data: resp_update});
                                });
                            }
                        });
                    }
                });
            } else {
                //not found
                res.rest.success({data: {message: Constant.NOT_FOUND}});
            }
        });
    }
});
//insert new movie
router.post('/insert-movie', function(req, res) {
    var data = {
        description : req.body['description'],
        title : req.body['title'],
        thumbnail : req.body['thumbnail'],
        cover_url : req.body['cover'],
        size : req.body['size'],
        note : req.body['note'],
        category_id: req.body['category_id']
    };
    var magnet_link = req.body['magnet_link'];
    var movie = new Movie();
    var common = new Common();
    data['code'] = 'swipex_' + common.get_timestamp();  //unique
    //create new
    //todo find duplicated magnet link
    movie.findOne({play_links: [magnet_link]}, function(resp_detail){
        if (resp_detail.result == Constant.OK_CODE && resp_detail.data != null && resp_detail.data['code'] != ''){
            res.rest.success({data: {message: Constant.DUPLICATE_MAGNET_LINK}});
        } else {
            //not found, mean magnet link is valid
            data['play_links'] = [magnet_link];
            data['is_active'] = 1;
            data['created_time'] = common.get_created_time();
            data['source'] = 'swipex';
            movie.create(data, function(resp_create){
                res.rest.success({data: resp_create});
            });
        }
    });
});
//save multiple movies
router.post('/bulk-update', function(req, res) {
    var params = JSON.parse(req.body['params']);
    //search movie by id
    var movie = new Movie();
    var len = params.length;
    var common = new Common();
    for (var i=0; i<len; i++){
        movie.findOneWithOrgData({_id: params[i]['id']}, params[i], function(resp_detail){
            if (resp_detail.result == Constant.OK_CODE){
                var update_detail = resp_detail.org_data;
                var detail = resp_detail.data;
                var play_links = detail['play_links'];
                if (common.isEmpty(play_links)){
                    play_links = [];
                }
                //do not add duplicated link
                if (play_links.length > 0){
                    //remove the link
                    play_links = play_links.filter(item => item != update_detail['magnet_link']);
                }
                play_links.push(update_detail['magnet_link']);    //to make sure latest link at the end
                //save back
                movie.update({_id: update_detail['id']}, {play_links: play_links, description: update_detail['description'],
                    note: update_detail['note'], category_id: update_detail['data_category']}, function(resp_update){
                    //do not return result
                });
            } else {
                //not found
                //skip it
            }
        });
    }
    res.rest.success({data: Constant.OK_CODE}); //nothing to update
});
//
router.post('/patch-title-description', function(req, res) {
    var movie = new Movie();
    var common = new Common();
    movie.getAll(function (resp) {
        if (resp.data){
            var list = resp.data;
            var len = list.length;
            for (var i=0; i<len; i++){
                if (common.isEmpty(list[i]['description'])){
                    list[i]['description'] = list[i]['title'];
                }
                list[i]['title'] = list[i]['code'];
                movie.update({_id:list[i]['_id']}, list[i], function ({}) {
                    //
                });
            }
        }
        res.rest.success();
    });
});
//
router.post('/inactive-jogae', function(req, res) {
    var movie = new Movie();
    var common = new Common();
    movie.getAll(function (resp) {
        if (resp.data){
            var list = resp.data;
            var len = list.length;
            for (var i=0; i<len; i++){
                if (list[i]['source'] == 'jogae') {
                    list[i]['is_active'] = 0;
                    movie.update({_id: list[i]['_id']}, list[i], function ({}) {

                    });
                }
            }
        }
        res.rest.success();
    });
});
//get speed data of all active movies
router.get('/speed-data', function(req, res) {
    var movie = new Movie();
    var common = new Common();
    movie.getAllNoPaging({is_active: 1, $or: [{is_processed_speed: 0}, {is_processed_speed: {$exists: false}}], play_links: {$exists: true, $ne: []}}, function (resp) {
        if (resp.data != null){
            var list = resp.data;
            var ids = [];
            for (var i=0; i<list.length; i++){
                ids.push(list[i]['_id']);
            }
            var deviceMovieSpeed = new DeviceMovieSpeed();
            deviceMovieSpeed.getAllNoPaging({movie_id:{$in:ids}, downloadSpeed: {$exists: true, $ne: []}}, function (resp_list) {
                if (resp_list.result == Constant.OK_CODE && resp_list.data != null){
                    res.rest.success({data: resp_list.data});
                } else {
                    res.rest.success({data: []});
                }
            });
        } else {
            res.rest.success({data: []});
        }
    });
});
//update speed data of movies
router.post('/update-speed', function(req, res) {
    var data = req.body['data'];
    if (data == null || data === undefined){
        res.rest.success({data: {message: Constant.OK_CODE}});
    }
    var list = JSON.parse(data);
    // console.log(list);
    var movie = new Movie();
    for (var i=0; i<list.length; i++){
        movie.update({_id: list[i]['movie_id']}, {speed: list[i]['speed'], is_processed_speed: 1}, function(){});
    }
    res.rest.success({data: {message: Constant.OK_CODE}});
});
//
module.exports = router;
