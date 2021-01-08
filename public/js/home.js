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
            render_home_list(resp.data);
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
        $('.data-gender', $tmpl).text(common.convert_gender(list[i]['Sex']));
        $('.data-gender', $tmpl).addClass(common.convert_gender_color(list[i]['Sex']));
        $('.data-looking-for', $tmpl).text(list[i]['LookingFor']);
        $('.data-name', $tmpl).text(list[i]['Name']);
        $('.data-province', $tmpl).text(common.convert_province(list[i]['Province']));
        $('.data-age', $tmpl).text(list[i][' Age']);
        $('.data-married-status', $tmpl).text(common.convert_married_status(list[i]['MariedStatus']));
        $('.data-objective', $tmpl).text(common.convert_objective(list[i]['Objective']));
        $('.data-date', $tmpl).text(common.convert_unix_to_date(list[i]['updated_time']));

        $container.append($tmpl.removeAttr('id').removeClass('hidden'));
    }
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
        $('.description', $tmpl).text(list[i]['LookingFor']);
        $('.status', $tmpl).text(common.convert_married_status(list[i]['MariedStatus']));
        $('.objective', $tmpl).text(common.convert_objective(list[i]['Objective']));
        $sitebar_items_tmpl.append($tmpl.removeAttr('id').removeClass('hidden'));
    }
    $('#sidebar_container').append($sitebar_items_tmpl.removeAttr('id').removeClass('hidden'));
}
//==========
var homeClass = new HomeClass();		//global object
