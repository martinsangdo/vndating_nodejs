/**
 * author: Martin SangDo
 Manage home
 */
//========== CLASS
function HomeClass() { }

//get data home page, called when load page
HomeClass.prototype.get_homepage_list = function() {
    var page_index = common.get_url_param('page');      //start from 1
    common.ajaxRawGet(API_URI.HOME_LIST+'?page='+page_index, function(resp){
        if (resp.message == CONST.OK_CODE && resp.data != null){
            //cache the data of 500 users??? dont need, usually they always looking for new person
            render_home_list(resp.data);
            render_paging(page_index, resp.total, window.location.origin+'?');
        } else {

        }
    });
};
//get random users
HomeClass.prototype.random_user_by_gender = function(gender_code) {
    common.ajaxRawGet(API_URI.RANDOM_USER+'?code='+gender_code, function(resp){
        if (resp.message == CONST.OK_CODE && resp.data != null){
            render_random_user(gender_code, resp.data);
        } else {
            //nothing shown
        }
    });
};
//private
function render_home_list(list){
    if (list.length == 0){
        return;
    }
    var $tmpl;
    var $container = $('#home_list');
    var len = list.length;
    for (var i=0; i<len; i++){
        $tmpl = $('#person_tmpl').clone(false);
        $('.home_img_thumb', $tmpl).attr('src', API_URI.HENHO_DOMAIN + list[i]['Picture']);
        $('.home_img_thumb', $tmpl).attr('onclick', 'window.location.href="'+common.compose_profile_link(list[i]['_id'], list[i]['Name'])+'"');
        $('.data-gender', $tmpl).text(common.convert_gender(list[i]['Sex']));
        $('.data-gender', $tmpl).addClass(common.convert_gender_color(list[i]['Sex']));
        $('.data-looking-for', $tmpl).text(list[i]['LookingFor']);
        $('.data-name', $tmpl).text(list[i]['Name']);
        $('.data-name', $tmpl).attr('href', common.compose_profile_link(list[i]['_id'], list[i]['Name']));
        $('.data-province', $tmpl).text(common.convert_province(list[i]['Province']));
        $('.data-age', $tmpl).text(list[i]['Age']);
        $('.data-married-status', $tmpl).text(common.convert_married_status(list[i]['MariedStatus']));
        $('.data-objective', $tmpl).text(common.convert_objective(list[i]['Objective']));
        $('.data-date', $tmpl).text(common.convert_unix_to_date(list[i]['updated_time']));

        $container.append($tmpl.removeAttr('id').removeClass('hidden'));
    }
}
//show max 5 pages on left & right
function render_paging(page_index, total, base_url){
    if (total == 0 || total == null || total == ''){
        return;
    }
    page_index = parseInt(page_index);
    if (isNaN(page_index) || page_index < 0){
        page_index = 1; //for showing in UI
    }
    //get total of page
    var total_page = Math.max(Math.floor(total / CONST.DEFAULT_PAGE_LEN), Math.ceil(total / CONST.DEFAULT_PAGE_LEN));
    if (page_index > total_page){
        page_index = total_page;
    }
    var $paging_tmpl = ('#paging_tmpl');
    var $paging_list = $('#paging_list');
    var min, max, $item_tmpl;   //page index
    //show left side
    max = page_index - 1;
    min = max - CONST.PAGE_OFFSET_DISPLAY;
    if (min > 1){
        append_paging_index(1, 1, total_page, $paging_tmpl, $paging_list, '.li_normal', base_url);    //show page 1
    }
    if (min > 2){
        append_paging_dot($paging_tmpl, $paging_list, '.li_normal', base_url);
    }
    append_paging_index(min, max, total_page, $paging_tmpl, $paging_list, '.li_normal', base_url);
    //show active item
    append_paging_index(page_index, page_index, total_page, $paging_tmpl, $paging_list, '.li_active', base_url);
    //show right side
    min = page_index + 1;
    max = min + CONST.PAGE_OFFSET_DISPLAY;
    append_paging_index(min, max, total_page, $paging_tmpl, $paging_list, '.li_normal', base_url);
    if (max + 1 < total_page){
        append_paging_dot($paging_tmpl, $paging_list, '.li_normal', base_url);
    }
    if (max < total_page){
        append_paging_index(total_page, total_page, total_page, $paging_tmpl, $paging_list, '.li_normal', base_url);
    }
    $('#paging_list').removeClass('hidden');
}
//
function append_paging_index(min, max, total_page, $paging_tmpl, $paging_list, item_class, base_url){
    var $item_tmpl;
    for (var i=min; i<=max; i++){
        if (i<1 || i>total_page){
            continue;
        }
        $item_tmpl = $(item_class, $paging_tmpl).clone(false);
        $('a', $item_tmpl).text(i);
        $('a', $item_tmpl).attr('href', base_url+'page='+i);
        $paging_list.append($item_tmpl);
    }
}
//
function append_paging_dot($paging_tmpl, $paging_list, item_class, base_url){
    var $item_tmpl = $(item_class, $paging_tmpl).clone(false);
    $('a', $item_tmpl).text('...');
    $paging_list.append($item_tmpl);
}
//
function render_random_user(gender_code, list){
    if (list.length == 0){
        return;
    }
    var $sitebar_items_tmpl = $('#sitebar_items_tmpl').clone(false);
    $('.gender', $sitebar_items_tmpl).text(common.convert_gender(gender_code));
    var len = list.length;
    var $tmpl
    for (var i=0; i<len; i++){
        $tmpl = $('#item_user_tmpl', $sitebar_items_tmpl).clone(false);
        $('.avatar', $tmpl).attr('src', API_URI.HENHO_DOMAIN + list[i]['Picture']);
        $('.avatar_link', $tmpl).attr('href', common.compose_profile_link(list[i]['_id'], list[i]['Name']));
        $('.description', $tmpl).text(list[i]['LookingFor']);
        $('.description', $tmpl).attr('href', common.compose_profile_link(list[i]['_id'], list[i]['Name']));
        $('.status', $tmpl).text(common.convert_married_status(list[i]['MariedStatus']));
        $('.objective', $tmpl).text(common.convert_objective(list[i]['Objective']));
        $sitebar_items_tmpl.append($tmpl.removeAttr('id').removeClass('hidden'));
    }
    $('#sidebar_container').append($sitebar_items_tmpl.removeAttr('id').removeClass('hidden'));
}
//==========
var homeClass = new HomeClass();		//global object
