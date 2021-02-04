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

//==========
var profileClass = new ProfileClass();		//global object
