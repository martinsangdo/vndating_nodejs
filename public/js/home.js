/**
 * author: Martin SangDo
 Manage home
 */
//========== CLASS
function HomeClass() { }

//get data home page
HomeClass.prototype.get_homepage_list = function() {
    var page_index = common.get_url_param('page');      //start from 1

};

//==========
var homeClass = new HomeClass();		//global object
