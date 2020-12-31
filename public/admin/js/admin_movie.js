/**
 * author: Martin SangDo
 Manage movies
 */
//========== CLASS
function AdminMovie() { }

//get list with pagination. page_index starts from 1
AdminMovie.prototype.get_pagination_list = function(page_index, category_id, keyword, status, min_speed, max_speed){
    var uri = ADMIN_API_URI.GET_MOVIE_LIST+'?page='+page_index;
    if (common.isset(category_id) && category_id != 'all'){
        uri += '&cat_id='+category_id.trim();
    }
    if (common.isset(status) && status != 'all'){
        uri += '&status='+status.trim();
        $('#select_status').val(status.trim());
    }
    if (common.isset(min_speed) && min_speed != 'all'){
        uri += '&min_speed='+min_speed.trim();
    }
    if (common.isset(max_speed) && max_speed != 'all'){
        uri += '&max_speed='+max_speed.trim();
        $('#select_speed').val(max_speed.trim());
    }
    if (common.isset(keyword)){
        uri += '&keyword='+keyword.trim();
        $('#txt_keyword').val(keyword.trim());
    }
    common.ajaxRawGet(uri, function(resp){
        if (common.isset(resp) && common.isset(resp.list) && resp.list.length > 0){
            //render to UI
            var $row, item;
            var list_ids = [];
            for (var i=0; i<resp.list.length; i++){
                item = resp.list[i];
                list_ids.push(item['_id']);
                $row = $('tr', $('#template_tbl')).clone(false);
                $('.link_data_title', $row).text(item['title']);
                $('.data_description', $row).text(item['description']);
                $('.data_thumbnail', $row).attr('src', item['thumbnail']);
                $('.data_cover', $row).attr('src', item['cover_url']);
                $('.data_note', $row).val(item['note']);
                if (common.isset(item['speed'])){
                    $('.data_speed', $row).text(common.format_speed_2_string(item['speed']));
                }
                $('.chk_active', $row).prop('checked', Boolean(parseInt(item['is_active']) > 0));
                if (common.isset(item['play_links']) && item['play_links'].length > 0){
                    var final_link = item['play_links'][item['play_links'].length-1];
                    $('.magnet_link', $row).val(adminCommon.decrypt_magnet_link(final_link));
                }
                $row.attr('data-id', item['_id']);
                $row.attr('data-size', item['size']);
                if (item['thumb_pics'] != null){
                    $row.attr('data-pics', item['thumb_pics'].join(','));
                }
                adminMovie.fetch_categories(resp.categories, item['category_id'], $('.data_category', $row));
                $('#real_tbl').append($row);
            }
        }
        $('#total_movies').text(resp.total);
        if (resp.total <= CONST.DEFAULT_PAGE_LEN){
            var total_pages = 1;    //only 1 page
        } else {
            var total_pages = Math.ceil(resp.total / CONST.DEFAULT_PAGE_LEN);
        }
        $('#txt_total_pages').text(total_pages);
        $('#txt_current_paging').val(page_index);
        //fetch categories to dropdown in search
        adminMovie.fetch_categories(resp.categories, category_id, $('#select_category'))
        adminMovie.preview_big_image();
    });
};
//preview big image
AdminMovie.prototype.preview_big_image = function() {
    $('.movie_thumb_list', $('#real_tbl')).unbind();
    $('.movie_thumb_list', $('#real_tbl')).hover(function(e){
        //hover in
        if (e != null && e.currentTarget != null &&
            $(e.currentTarget).attr('src') != null || $(e.currentTarget).attr('src') != ''){
            $('#img_preview').attr('src', $(e.currentTarget).attr('src'));
            $('#div_big_img').removeClass('hidden');
        }
    }, function(){
            $('#div_big_img').addClass('hidden');
    });
    $('.movie_thumb_list_landscape', $('#real_tbl')).unbind();
    $('.movie_thumb_list_landscape', $('#real_tbl')).hover(function(e){
        //hover in
        if (e != null && e.currentTarget != null &&
            $(e.currentTarget).attr('src') != null || $(e.currentTarget).attr('src') != ''){
            $('#img_preview').attr('src', $(e.currentTarget).attr('src'));
            $('#div_big_img').removeClass('hidden');
        }
    }, function(){
        $('#div_big_img').addClass('hidden');
    });
};
//show dialog to confirm deleting movie(s)
AdminMovie.prototype.save_current_row = function(btn_save){
    if (submitting){
        return;
    }
    var $row = $(btn_save).closest('tr');
    var pure_magnet_link = $('.magnet_link', $row).val().trim();
    if (common.isset(pure_magnet_link) && !pure_magnet_link.startsWith(ADMIN_CONSTANT_JS.MAGNET_LINK_PREFIX)){
        adminCommon.showToast('Invalid magnet link format!', true, 'error');
        return;
    }
    submitting = true;
    var params = {
        id: $row.attr('data-id'),
        description: $('.data_description', $row).val().trim(),
        note: $('.data_note', $row).val().trim(),
        data_category: $('.data_category', $row).val(),
        magnet_link: adminCommon.decrypt_magnet_link(pure_magnet_link)
    };
    adminCommon.showToast();
    common.ajaxPost(ADMIN_API_URI.SAVE_BASIC_MOVIE_DETAIL, params, function(resp){
        if (resp == 'OK'){
            //success
            adminCommon.updateToastAndClose(STR_MESS_FRONT.UPDATE_SUCCESS);
        } else {
            adminCommon.updateToastAndClose(STR_MESS_FRONT.SERVER_ERROR);
        }
        submitting = false;
    });
};
//call server to soft delete movie(s)
AdminMovie.prototype.toggleCheckboxActive = function(chk_active){
    if (submitting){
        return;
    }
    var $row = $(chk_active).closest('tr');
    var is_active = $('.chk_active', $row).is(':checked')?1:0;
    var uri = ADMIN_API_URI.DELETE_MOVIES;
    var id = $row.attr('data-id');
    submitting = true;
    common.ajaxPost(uri, {ids: JSON.stringify(id), is_active: is_active}, function(resp){
        if (common.isset(resp) && resp == CONST.OK_CODE){
            //do nothing
        } else {
            //no result or error
            adminCommon.updateToastAndClose(STR_MESS_FRONT.SERVER_ERROR);
        }
        submitting = false;
    });
};
//go to previous page
AdminMovie.prototype.go_previous_page = function(){
    var page_index = common.get_url_param('page');
    if (page_index == '' || isNaN(page_index) || parseInt(page_index)<=0){
        page_index = 1;
    }
    page_index = parseInt(page_index);
    if (page_index == 1){
        return; //being in first page
    }
    window.location.href = '/admin-movie/list?page=' + (page_index-1);
};
//go to next page
AdminMovie.prototype.go_next_page = function(){
    var page_index = common.get_url_param('page');
    if (page_index == '' || isNaN(page_index) || parseInt(page_index)<=0){
        page_index = 1;
    }
    page_index = parseInt(page_index);
    if (page_index == parseInt($('#txt_total_pages').text())){
        return; //being in last page
    }
    window.location.href = '/admin-movie/list?page=' + (page_index+1);
};
//search movies
AdminMovie.prototype.search = function(){
    var keyword = $('#txt_keyword').val().trim();
    var cat_id = $('#select_category').val();
    var speed = $('#select_speed').val();
    var status = $('#select_status').val();

    if (keyword.length < 3 && cat_id == 'all' && speed == 'all' && status == 'all'){
        //nothing to search here
        common.redirect('/admin-movie/list');
    }
    var uri = '/admin-movie/list?page=1';
    if (common.isset(cat_id) && cat_id != 'all'){
        uri += '&cat_id='+cat_id;
    }
    if (common.isset(keyword)){
        uri += '&keyword='+keyword;
    }
    if (common.isset(status) && status != 'all'){
        uri += '&status='+status;
    }
    if (common.isset(speed) && speed != 'all'){
        uri += '&max_speed='+speed;
        if (speed == 300){
            uri += '&min_speed=0';
        } else if (speed == 700){
            uri += '&min_speed=300';
        } else if (speed == 1000){
            uri += '&min_speed=700';
        }
    }
    common.redirect(uri);
};
//========== DETAIL
//get movie detail
AdminMovie.prototype.get_detail = function(){
    var movie_id = common.get_url_param('id').trim();
    if (movie_id == ''){
        //get active categories only
        common.ajaxRawGet(ADMIN_API_URI.GET_ACTIVE_CATEGORY_LIST, function(resp_cat){
            if (common.isset(resp_cat) && common.isset(resp_cat.categories)) {
                adminMovie.fetch_categories(resp_cat.categories, '', $('#select_category'));
            }
        });
        return;
    }
    /*
    var uri = ADMIN_API_URI.GET_MOVIE_DETAIL + movie_id;
    common.ajaxRawGet(uri, function(resp){
        if (common.isset(resp)){
            if (common.isset(resp.data)){
                var detail = resp.data;
                //has detail, show it to UI
                var $container = $('#tbl_form');
                $('#txt_code', $container).val(detail['code']);
                $('#txt_title', $container).val(detail['title']);
                if (detail['play_links'] != null && detail['play_links'].length > 0){
                    $('#txt_magnet_link', $container).val(adminCommon.decrypt_magnet_link(detail['play_links'][detail['play_links'].length - 1]));
                }
                $('#txt_thumbnail_url', $container).val(detail['thumbnail']);
                if (common.isset(detail['thumbnail'])){
                    $('#img_thumbnail').attr('src', detail['thumbnail']);
                }
                $('#txt_cover_url', $container).val(detail['cover_url']);
                if (common.isset(detail['cover_url'])){
                    $('#img_cover').attr('src', detail['cover_url']);
                }
                $('#txt_size', $container).val(detail['size']);
                $('#txt_speed', $container).val(detail['speed']);
                $('#txt_note', $container).val(detail['note']);
                //fetch categories to dropdown
                adminMovie.fetch_categories(resp.categories, detail['category_id']);
                //show thumbnails, if any
                if (common.isset(detail['thumb_pics']) && detail['thumb_pics'].length > 0){
                    for (var i=0; i<detail['thumb_pics'].length; i++){
                        $('#thumb_pics').append('<img class="movie_thumb_list_landscape g-ma-5" src="'+detail['thumb_pics'][i]+'"/>');
                    }
                }
            } else {
                $('#label_not_found').removeClass('hidden');    //not found detail
            }
        } else {
            $('#label_not_found').removeClass('hidden');    //not found detail
            //no result or error
            adminCommon.updateToastAndClose(STR_MESS_FRONT.SERVER_ERROR);
        }
    });
    */
};
//create/update movie
/*
AdminMovie.prototype.upsert_detail = function(){
    if (submitting){
        return;
    }
    //check required fields
    var $container = $('#tbl_form');
    var movie_id = common.get_url_param('id').trim();
    var params = {
        movie_id : movie_id,
        code : $('#txt_code', $container).val().trim(),
        title : $('#txt_title', $container).val().trim(),
        magnet_link : adminCommon.decrypt_magnet_link($('#txt_magnet_link', $container).val().trim()),
        thumbnail : $('#txt_thumbnail_url', $container).val().trim(),
        cover : $('#txt_cover_url', $container).val().trim(),
        category_id: $('#select_category', $container).val(),
        size : $('#txt_size', $container).val().trim(),
        speed : $('#txt_speed', $container).val().trim(),
        note : $('#txt_note', $container).val().trim()
    };

    if (params['code'] == '' || params['title'] == '' || params['magnet_link'] == '' ||
        params['thumbnail'] == '' || params['cover'] == ''){
        adminCommon.showToast("Please input required items (*)");
        setTimeout(function(){
            adminCommon.closeToast();
        }, 2000);
        return;
    }
    //validate magnet link
    if (!params['magnet_link'].startsWith(ADMIN_CONSTANT_JS.MAGNET_LINK_PREFIX)){
        adminCommon.showToast('Invalid magnet link format!', true, 'error');
        return;
    }
    //
    submitting = true;
    adminCommon.showToast();
    common.ajaxPost(ADMIN_API_URI.UPSERT_MOVIE, params, function(resp){
        if (resp != null && resp['result'] == 'OK'){
            //success
            adminCommon.updateToastAndClose(STR_MESS_FRONT.UPDATE_SUCCESS);
            if (movie_id == ''){
                //clear the form
                $('input[type="text"]', $container).val('');
                $('textarea', $container).val('');
            }
        } else if (common.isset(resp.message)){
            adminCommon.updateToastAndClose(resp.message);
        } else {
            adminCommon.updateToastAndClose(STR_MESS_FRONT.SERVER_ERROR);
        }
        submitting = false;
    });
};
*/
AdminMovie.prototype.insert_detail = function(){
    if (submitting){
        return;
    }
    //check required fields
    var $container = $('#tbl_form');
    var params = {
        title : $('#txt_title', $container).val().trim(),
        description : $('#txt_description', $container).val().trim(),
        magnet_link : adminCommon.decrypt_magnet_link($('#txt_magnet_link', $container).val().trim()),
        thumbnail : $('#txt_thumbnail_url', $container).val().trim(),
        cover : $('#txt_cover_url', $container).val().trim(),
        category_id: $('#select_category', $container).val(),
        size : $('#txt_size', $container).val().trim(),
        note : $('#txt_note', $container).val().trim()
    };

    if (params['title'] == '' || params['magnet_link'] == '' ||
        params['thumbnail'] == '' || params['cover'] == ''){
        adminCommon.showToast('Please input required items (*)', true, 'error');
        return;
    }
    //validate magnet link
    if (!params['magnet_link'].startsWith(ADMIN_CONSTANT_JS.MAGNET_LINK_PREFIX)){
        adminCommon.showToast('Invalid magnet link format!', true, 'error');
        return;
    }
    //
    submitting = true;
    adminCommon.showToast();
    common.ajaxPost(ADMIN_API_URI.INSERT_MOVIE, params, function(resp){
        if (resp != null && resp['result'] == 'OK'){
            //success
            adminCommon.updateToastAndClose(STR_MESS_FRONT.CREATE_SUCCESS);
            //clear the form
            $('input[type="text"]', $container).val('');
            $('textarea', $container).val('');
        } else if (common.isset(resp.message)){
            adminCommon.updateToastAndClose(resp.message);
        } else {
            adminCommon.updateToastAndClose(STR_MESS_FRONT.SERVER_ERROR);
        }
        submitting = false;
    });
};
//
AdminMovie.prototype.fetch_categories = function(categories, focus_cat_id, $select) {
    //categories rows
    for (var i=0; i<categories.length; i++){
        if (categories[i].name != null){
            if (focus_cat_id == categories[i]['_id']){
                $select.append('<option value="'+categories[i]['_id']+'" selected="selected">'+categories[i]['name']+'</option>');
            } else {
                $select.append('<option value="'+categories[i]['_id']+'">'+categories[i]['name']+'</option>');
            }
        }
    }
};
//
AdminMovie.prototype.bulk_update_movies = function() {
    if (submitting){
        return;
    }
    //get all movie id(s) need to be deleted
    var $rows = $('.'+ADMIN_CONSTANT_JS.MARK_ROW_BG, $('#real_tbl'));
    if ($rows == null || $rows.length == 0){
        return; //nothing to update
    }
    // submitting = true;
    var params = [], $row;      //id
    for (var i=0; i<$rows.length; i++){
        $row = $($rows[i]);
        params.push({
            id: $row.attr('data-id'),
            description: $('.data_description', $row).val().trim(),
            note: $('.data_note', $row).val().trim(),
            data_category: $('.data_category', $row).val(),
            magnet_link: adminCommon.decrypt_magnet_link(adminCommon.decrypt_magnet_link($('.magnet_link', $row).val().trim()))
        });
    }
    // console.log(params);
    adminCommon.showToast();
    common.ajaxPost(ADMIN_API_URI.BULK_UPDATE_MOVIES, {params: JSON.stringify(params)}, function(resp){
        if (resp == 'OK'){
            //success
            adminCommon.updateToastAndClose(STR_MESS_FRONT.UPDATE_SUCCESS);
        } else {
            adminCommon.updateToastAndClose(STR_MESS_FRONT.SERVER_ERROR);
        }
        submitting = false;
    });
};
//show popup to edit movies
AdminMovie.prototype.open_detail_popup = function(btn_title) {
    $('#div_backdrop').removeClass('hidden');
    //show detail
    var $form_container = $('#div_movie_extra_detail');
    var $row = $(btn_title).closest('tr');
    $form_container.attr('data-id', $row.attr('data-id'));
    $('.txt_title', $form_container).val($('.link_data_title', $row).text());
    $('.txt_thumbnail_url', $form_container).val($('.data_thumbnail', $row).attr('src'));
    $('.txt_cover_url', $form_container).val($('.data_cover', $row).attr('src'));
    $('.txt_size', $form_container).val($row.attr('data-size'));
    $('.thumb_pics', $form_container).empty();
    var pics = $row.attr('data-pics');
    if (pics != ''){
        pics = pics.split(',');
        for (var j=0; j<6; j++){
            //display max 6 pics
            $('.thumb_pics', $form_container).append('<img src="'+pics[j]+'"/>')
        }
    }
    //
    $('#div_movie_extra_detail').removeClass('hidden');
};
//close & do nothing
AdminMovie.prototype.close_detail_popup = function() {
    $('#div_movie_extra_detail').addClass('hidden');
    $('#div_backdrop').addClass('hidden');
};
//update detail in popup
AdminMovie.prototype.update_extra_detail = function() {
    if (submitting){
        return;
    }
    var $form_container = $('#div_movie_extra_detail');
    var title = $('.txt_title', $form_container).val().trim();
    if (title == ''){
        adminCommon.showToast('Please input title', true, 'error');
        return;
    }
    submitting = true;
    var id = $form_container.attr('data-id');
    var params = {
        id: id,
        title: title,
        thumbnail: $('.txt_thumbnail_url', $form_container).val().trim(),
        cover_url: $('.txt_cover_url', $form_container).val().trim(),
        size: $('.txt_size', $form_container).val()
    };
    adminCommon.showToast();
    common.ajaxPost(ADMIN_API_URI.SAVE_EXTRA_MOVIE_DETAIL, params, function(resp){
        if (resp == 'OK'){
            //success, update row in list
            var $row = $('tr[data-id="'+id+'"]', $('#real_tbl'));
            $('.link_data_title', $row).text(title);
            $('.data_thumbnail', $row).attr('src', $('.txt_thumbnail_url', $form_container).val().trim());
            $('.data_cover', $row).attr('src', $('.txt_cover_url', $form_container).val().trim());
            adminCommon.updateToastAndClose(STR_MESS_FRONT.UPDATE_SUCCESS);
            setTimeout(function(){
                adminMovie.close_detail_popup();
            }, 1000);
        } else {
            adminCommon.updateToastAndClose(STR_MESS_FRONT.SERVER_ERROR);
        }
        submitting = false;
    });
};
//update speed of all active movies
AdminMovie.prototype.update_speed = function() {
    if (submitting){
        return;
    }
    adminCommon.showToast();
    submitting = true;
    common.ajaxRawGet(ADMIN_API_URI.GET_SPEED_DATA, function(resp){
        if (resp.message == 'OK'){
            //begin composing speed for each movie
            adminMovie.compose_speed(resp.data);
        } else {
            adminCommon.updateToastAndClose(STR_MESS_FRONT.SERVER_ERROR);
            submitting = false;
        }
    });
};
//private function
AdminMovie.prototype.compose_speed = function(speed_list) {
    // console.log('speed_list', speed_list);
    if (speed_list == null || speed_list.length == 0){
        submitting = false;
        adminCommon.updateToastAndClose(STR_MESS_FRONT.UPDATE_SUCCESS);
        return;
    }
    var len = speed_list.length;
    var speed_map = {};     //key: movie id, value: speed data list
    var movie_speed_item_data;
    for (var i=0; i<len; i++){
        movie_speed_item_data = speed_map[speed_list[i]['movie_id']];
        if (movie_speed_item_data == null){
            movie_speed_item_data = {
                min_len_seconds: 1000000,      //min length of download speed array
                list: [],
                speed: 0    //average speed
            };
        }
        if (movie_speed_item_data['min_len_seconds'] > speed_list[i]['downloadSpeed'].length){
            movie_speed_item_data['min_len_seconds'] = speed_list[i]['downloadSpeed'].length;
        }
        movie_speed_item_data['list'].push(speed_list[i]['downloadSpeed']);
        speed_map[speed_list[i]['movie_id']] = movie_speed_item_data;
    }
    var list_device_len, avg_speed_each_movie, sum_speed_each_movie_at_second, max_avg, avg, params = [];
    for (var movie_id in speed_map) {
        // console.log('list', speed_map[movie_id]['list']);
        list_device_len = speed_map[movie_id]['list'].length;
        avg_speed_each_movie = [];
        max_avg = 0;
        for (var second = 0; second<speed_map[movie_id]['min_len_seconds']; second++){
            sum_speed_each_movie_at_second = 0;
            for (var device_index=0; device_index<list_device_len; device_index++){ //for each device
                sum_speed_each_movie_at_second += speed_map[movie_id]['list'][device_index][second];
            }
            avg = Math.floor(sum_speed_each_movie_at_second / list_device_len);
            avg_speed_each_movie.push(avg);
            if (max_avg < avg){
                max_avg = avg;
            }
        }
        params.push({
            movie_id: movie_id, speed: max_avg
        });
    }

    common.ajaxPost(ADMIN_API_URI.UPDATE_SPEED, {data: JSON.stringify(params)}, function(resp){
        if (resp.message == 'OK'){
            adminCommon.updateToastAndClose(STR_MESS_FRONT.UPDATE_SUCCESS);
            //refresh current page
            setTimeout(function(){
                common.redirect(window.location.href);
            }, 2000);
        } else {
            adminCommon.updateToastAndClose(STR_MESS_FRONT.SERVER_ERROR);
        }
        submitting = false;
    });
};
//==========
var adminMovie = new AdminMovie();		//global object
