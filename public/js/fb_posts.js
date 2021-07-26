
var token = '';
function get_fb_groups() {
    token = $.trim($('#txt_token').val());
    if (token == ''){
        return;
    }
    common.ajaxRawGet(
        API_URI.GET_FB_GROUPS+token,
        function (resp) {
            if (resp.data != null){
                //fill into select box
                var len = resp.data.length;
                var $sel = $('#sel_groups');
                $sel.append('<option value="">'+len+'</option>');
                for (var i=0; i<len; i++){
                    $sel.append('<option value="'+resp.data[i]['id']+'">'+(i+1)+'. ' + resp.data[i]['name']+'</option>');
                }
            }
        }
    );
}
//
function get_fb_group_feeds(){
    var group_id = $('#sel_groups').val();
    if (group_id == ''){
        return;
    }
    common.ajaxRawGet(
        API_URI.GET_FB_GROUP_FEEDS+token+'&group_id='+group_id,
        function (resp) {
            if (resp != null){
                //fetch UI
                show_group_feeds(resp);
            }
        }
    );
}
//
function show_group_feeds(list){
    var $tbl = $('#tbl_list');
    $('.tr', $tbl).remove();
    for (var i=0; i<list.length; i++){
        var $tr = $('<tr></tr>').addClass('tr').attr('data-id', list[i]['id']);
        $tr.append('<td>'+list[i]['comment_count']+'</td>');
        $tr.append('<td><img src="'+list[i]['picture']+'"/></td>');
        $tr.append('<td><a target="_blank" href="https://facebook.com/'+list[i]['id']+'">'+list[i]['message']+'</a></td>');
        $tr.append('<td>'+list[i]['updated_time']+'</td>');
        $tr.append('<td><input type="button" value="comment" onclick="comment_fb_post(this);"/></td>');
        $tbl.append($tr);
    }
}
//
function comment_fb_post(btn){
    var post_id = $(btn).closest('tr').attr('data-id');
    common.ajaxPost(API_URI.POST_COMMENT_FB_GROUP, {
        access_token: token,
        post_id: post_id,
        message: $.trim($('#txt_general_comment').val())
    }, function(resp){
        //clear this row
        $(btn).closest('tr').remove();
    }, function(err){
        //show alert
        console.log('something wrong post_id:' + post_id, err);
    });
}
