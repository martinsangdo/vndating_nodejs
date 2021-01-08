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
            //todo right side
        } else {

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
        $('.data-gender', $tmpl).text(list[i]['Sex']);
        $('.data-looking-for', $tmpl).text(list[i]['LookingFor']);
        $('.data-name', $tmpl).text(list[i]['Name']);
        $('.data-province', $tmpl).text(list[i]['Province']);
        $('.data-age', $tmpl).text(list[i]['Age']);
        $('.data-married-status', $tmpl).text(list[i]['MariedStatus']);
        $('.data-objective', $tmpl).text(list[i]['Objective']);

        $container.append($tmpl.removeAttr('id').removeClass('hidden'));
    }
}
//==========
var homeClass = new HomeClass();		//global object
