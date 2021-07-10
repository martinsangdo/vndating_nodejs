
//========== CLASS
function AdminUser() { }

AdminUser.prototype.fetch_user_list = function(user_list) {
    var $container = $('#tbl_data');
    var $tr;
    for (var i=0; i<user_list.length; i++){
        $tr = $('<tr></tr>');
        $tr.append('<td>'+(i+1)+'</td><td>'+user_list[i]['Name']+'</td><td>'+
            common.convert_unix_to_datetime(user_list[i]['SubscribeTimeLive'])+'</td><td>'+common.convert_unix_to_datetime(user_list[i]['created_time'])+'</td>')
        $container.append($tr);
    }
};
//=
$(document).ready(function(){
    common.ajaxRawGet(ADMIN_API_URI.NEW_USER_LIST, function(resp_detail){
        var adminUser = new AdminUser();
        adminUser.fetch_user_list(resp_detail['list']);
        //
        $('#total').text(resp_detail['total']);
    });
});
