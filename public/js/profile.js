/**
 * author: Martin SangDo
 Manage profile
 */
//========== CLASS
function ProfileClass() { }

//show info of user
ProfileClass.prototype.show_info = function() {
    $('#MariedStatus').text(common.convert_married_status($('#MariedStatus').attr('data-value')));
    $('#Objective').text(common.convert_objective($('#Objective').attr('data-value')));
    $('#Province').text(common.convert_province($('#Province').attr('data-value')));
    $('#Degree').text(common.convert_degree($('#Degree').attr('data-value')));
    $('#Sex').text(common.convert_gender($('#Sex').attr('data-value')));
};
//search related users which having same gender/marital status/objective/province
ProfileClass.prototype.search_related_users = function() {
    common.ajaxRawGet(API_URI.SAME_RELATED_PROFILE+
        '?marital='+$('#MariedStatus').attr('data-value')+
        '&objective='+$('#Objective').attr('data-value')+
        '&province='+$('#Province').attr('data-value')+
        '&sex='+$('#Sex').attr('data-value'), function(resp){
        //show them in UI
        if (resp['marital'] != null){
            fetch_related_user_profile($('#same_marital_status_container'), resp['marital']['data']);
        }
        if (resp['objective'] != null){
            fetch_related_user_profile($('#same_objective_container'), resp['objective']['data']);
        }
        if (resp['province'] != null){
            fetch_related_user_profile($('#same_province_container'), resp['province']['data']);
        }
        if (resp['sex'] != null){
            fetch_related_user_profile($('#same_gender_container'), resp['sex']['data']);
        }
    });
};
//
function fetch_related_user_profile($container, list){
    if (list == null){
        return;
    }
    var $tmpl;
    for (var i=0; i<list.length; i++){
        $tmpl = $('#user_item_tmpl').clone(false);
        $('.avatar', $tmpl).attr('src', API_URI.HENHO_DOMAIN + list[i]['Picture']);
        $('.avatar_link', $tmpl).attr('href', common.compose_profile_link(list[i]['_id'], list[i]['Name']));
        $('.description', $tmpl).text(list[i]['LookingFor']);
        $('.description', $tmpl).attr('href', common.compose_profile_link(list[i]['_id'], list[i]['Name']));
        $container.append($tmpl.removeAttr('id').removeClass('hidden'));
    }
}
//==========
var profileClass = new ProfileClass();		//global object
