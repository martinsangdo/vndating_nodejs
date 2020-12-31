/**
 * Process functions about users
 * author: Martin SangDo
 */
//========== CLASS
function AdminUser() { }

var adminUser = new AdminUser();		//global object
//update user info
AdminUser.prototype.save = function(row){
    if (submitting){
        return;
    }
    var $row = $(row).closest('tr');
    //validate input
    var name = $.trim($('.txt_name', $row).val());
    if (common.isEmpty(name)){
      common.show_alert('Please input name');
      return;
    }
    var email = $.trim($('.txt_email', $row).val());
    if (common.isEmpty(email) || !common.isValidEmail(email)){
      common.show_alert('Please input valid email');
      return;
    }
    var phone = $.trim($('.txt_phone', $row).val());
    if (!common.isEmpty(phone) && !common.isValidPhone(phone)){
      common.show_alert('Please input valid phone number');
      return;
    }
    //get active flags
    var active_flags = [];
    var $chk_active_list = $('.chk_active_list', $row);
    if ($chk_active_list.length > 0){
      for (var i=0; i<$('.chk_active', $chk_active_list).length; i++){
        active_flags.push({
          user_device_id: $($('.chk_active', $chk_active_list)[i]).attr('data-user-device-id'),
          is_active: $($('.chk_active', $chk_active_list)[i]).is(":checked")?1:0
        });
      }
    }
    //
    var params = {
        id: $row.attr('data-id'),
        name: name,
        email: email,
        phone: phone,
        address: $.trim($('.txt_address', $row).val()),
        note: $.trim($('.txt_note', $row).val())
    };
    if (active_flags.length > 0){
      params['active_flags'] = active_flags;
    }
    submitting = true;
    common.ajaxPost(ADMIN_API_URI.UPDATE_USER, params, function(resp){
        common.show_alert(STR_MESS_FRONT.UPDATE_SUCCESS);
        submitting = false;
    }, function(err){
      err = $.parseJSON(err);
      if (err.message == 'EMAIL_IS_EXISTED'){
        common.show_alert(STR_MESS_FRONT.EMAIL_IS_EXISTED);
      }
      submitting = false;
    });
};
//search by keyword or name
AdminUser.prototype.search = function(row){
    if (submitting){
        return;
    }
    var keyword = $.trim($('#txt_keyword').val());
    if (common.isEmpty(keyword) || keyword.length < 2){
      common.show_alert('Please input keyword at least 2 characters');
      return;
    }
    var params = {
        keyword: keyword,
    };
    submitting = true;
    common.ajaxPost(ADMIN_API_URI.SEARCH_USER, params, function(resp){
        if (resp.total_user > 0){
          //clear the UI & show searched users
          $('#div_pagination').remove();
          var $table = $('#tbl_data');
          var $tbl_tmpl = $('#tbl_tmpl');
          $('.tr', $table).remove();
          var data_list = resp.list;
          $('#total').text(resp.total_user);
          var $tr;
          for (var i=0; i<data_list.length; i++){
            var link_verify = '';
            if (!common.isEmpty(data_list[i].verify_token)){
              link_verify = '<a href="#modal_verify_link" data-modal-target="#modal_verify_link" data-modal-effect="fadein" onclick="adminUser.show_verify_link(\''+data_list[i].email+'\',\''+data_list[i].verify_token+'\');" title="See verify link"><i class="hs-admin-email"></i></a>';

            }
            $tr = $('.tr', $tbl_tmpl).clone(false);
            $('.txt_name', $tr).val(data_list[i].name);
            $('.txt_email', $tr).val(data_list[i].email);
            if (!common.isEmpty(data_list[i].verify_token)){
              $('.txt_verify_link', $tr).html('<a href="#modal_verify_link" data-modal-target="#modal_verify_link" data-modal-effect="fadein" onclick="adminUser.show_verify_link(\''+data_list[i].email+'\',\''+data_list[i].verify_token+'\');" title="See verify link"><i class="hs-admin-email"></i></a>');
            }
            $('.txt_phone', $tr).val(data_list[i].phone_number);
            $('.txt_address', $tr).val(data_list[i].address);
            $('.txt_note', $tr).val(data_list[i].note);
            //show active status of each device
            if (data_list[i].device_list && data_list[i].device_list.length > 0){
              for (var j=0; j<data_list[i].device_list.length; j++){
                $('ul', $('.device_list', $tr)).append('<li><input type="checkbox" class="chk_active" data-user-device-id="'+
                data_list[i].device_list[j].id+'" '+
                (data_list[i].device_list[j].is_active>0?'checked':'')+'  onchange="adminUser.toggle_active_device(this);"/> '+
                data_list[i].device_list[j].name+' ('+data_list[i].device_list[j].registered_time+
                ') <a href="#modal_device_logs" data-modal-target="#modal_device_logs" data-modal-effect="fadein" onclick="adminUser.show_device_logs('+
                data_list[i].id+','+data_list[i].device_list[j].device_id+');">Logs</a></li>');
              }
            }
            //show following channels
            if (data_list[i].following_channel_groups && $.isArray(data_list[i].following_channel_groups) && data_list[i].following_channel_groups.length > 0){
              for (var j=0; j<data_list[i].following_channel_groups.length; j++){
                $('ul', $('.following_channel_groups', $tr)).append('<li class="following_group_item" data-group-id="'+data_list[i].following_channel_groups[j].id+'">'+
                  data_list[i].following_channel_groups[j].name+'</li>');
              }
            }
            $table.append($tr.attr('data-id', data_list[i].id));
          }
          //init popup
          $.HSCore.components.HSModalWindow.init('[data-modal-target]');
        } else {
          //not found
          common.show_alert('User not found');
        }
        submitting = false;
    }, function(err){
        submitting = false;
    });
};
//open popup & show which groups user following
AdminUser.prototype.show_following_user_group = function(row){
  //uncheck all channel groups in popup
  var $modal_channel_groups = $('#modal_channel_groups');
  $('input[type="checkbox"]', $modal_channel_groups).prop('checked', false);
  //
  var $tr = $(row).closest('.tr');
  $('#selecting_user_id', $modal_channel_groups).val($tr.attr('data-id'));  //save user id here
  var $following_group_item = $('.following_group_item', $tr);
  if ($following_group_item.length == 0){
    //this user never followed any channel groups
    return;
  } else {
    var following_group_ids = [];
    for (var i=0; i<$following_group_item.length; i++){
        following_group_ids.push($($following_group_item[i]).attr('data-group-id'));
    }
    //
    var $channel_group_item = $('.channel_group_item', $modal_channel_groups);  //all channel groups in system
    for (var i=0; i<$channel_group_item.length; i++){
      if ($.inArray($($channel_group_item[i]).attr('data-group-id'), following_group_ids) >=0){
        $($($channel_group_item[i]), $modal_channel_groups).prop('checked', true);
      }
    }
  }
};
//update active status when user clicks on checkbox
AdminUser.prototype.toggle_active_device = function(chk_box) {
  if (submitting){
    return;
  }
  var $checkbox = $(chk_box);
  var params = {
    user_device_id: $checkbox.attr('data-user-device-id'),
    is_active: $checkbox.is(":checked")?1:0
  }
  submitting = true;
  common.ajaxPost(ADMIN_API_URI.UPDATE_USER_DEVICE_ACTIVE, params, function(resp){
    submitting = false;
  }, function(err){
      submitting = false;
  });
};
//save channel groups of user
AdminUser.prototype.save_user_group = function(){
  if (submitting){
    return;
  }
  var $modal_channel_groups = $('#modal_channel_groups');
  var $chk_groups = $('input[type="checkbox"]', $modal_channel_groups);
  var user_id = $('#selecting_user_id', $modal_channel_groups).val();
  var params = {
    user_id: user_id,
    groups_rel: []
  };
  var following_group_ids = [];   //to show up again in UI
  for (var i=0; i<$chk_groups.length; i++){
    params['groups_rel'].push({
      group_id: $($chk_groups[i]).attr('data-group-id'),
      is_following: $($chk_groups[i]).is(":checked")?1:0});
    if ($($chk_groups[i]).is(":checked")){
      following_group_ids.push({
        group_id: $($chk_groups[i]).attr('data-group-id'),
        group_name: $($('.group_name', $modal_channel_groups)[i]).text()
      });
    }
  }
  submitting = true;
  common.ajaxPost(ADMIN_API_URI.UPDATE_USER_CHANNEL_GROUP, params, function(resp){
    //update to UI
    $('.channel_groups', $('tr[data-id="'+user_id+'"]')).empty();
    for (var i=0; i<following_group_ids.length; i++){
      var $li = $('<li class="following_group_item" data-group-id="'+following_group_ids[i]['group_id']+'">'+following_group_ids[i]['group_name']+'</li>');
      $('.channel_groups', $('tr[data-id="'+user_id+'"]')).append($li);
    }
    //
    submitting = false;
    //close the popup
    Custombox.modal.close();
  }, function(err){
      submitting = false;
  });
};
//update user contact
AdminUser.prototype.save_contact = function(){
    if (submitting){
        return;
    }
    //validate input
    var email = $.trim($('#txt_email').val());
    if (common.isEmpty(email) || !common.isValidEmail(email)){
      common.show_alert('Please input valid email');
      return;
    }
    var phone = $.trim($('#txt_phone').val());
    if (!common.isEmpty(phone) && !common.isValidPhone(phone)){
      common.show_alert('Please input valid phone number');
      return;
    }
    var note1 = $.trim($('#txt_note1').val());
    var note2 = $.trim($('#txt_note2').val());
    //
    var params = {
        email: email,
        phone: phone,
        note1: note1,
        note2: note2
    };
    submitting = true;
    common.ajaxPost(ADMIN_API_URI.UPDATE_USER_CONTACT, params, function(resp){
        common.show_alert(STR_MESS_FRONT.UPDATE_SUCCESS);
        submitting = false;
    }, function(err){
      submitting = false;
    });
};

//show logs of change status of device
AdminUser.prototype.show_device_logs = function(user_id, device_id){
    var $modal_device_logs = $('#modal_device_logs');
    if (!$modal_device_logs.is(':hidden')){
      return;
    }
    //query the logs
    var params = {
      user_id: user_id,
      device_id: device_id
    };
    var $tbl_device_logs = $('#tbl_device_logs', $modal_device_logs);
    $('.tr', $tbl_device_logs).remove();   //clear old data
    common.ajaxPost(ADMIN_API_URI.GET_USER_DEVICE_LOGS, params, function(resp){
      if (resp){
        var $tr;
        var data = resp.list;
        for (var i=0; i<data.length; i++){
          $tr = $('<tr></tr>');
          $tr.append('<td>'+data[i].type+'</td><td>'+data[i].description+'</td><td>'+data[i].created_time+'</td>');
          $tbl_device_logs.append($tr.addClass('tr'));
        }
      } else {
        //no any log
        // common.show_alert('It is empty now');
      }
    }, function(err){
      common.show_alert(STR_MESS_FRONT.SERVER_ERROR);
    });
};
//export all users
AdminUser.prototype.export_users = function(){
  if (submitting){
      return;
  }
  submitting = true;
  common.ajaxPost(ADMIN_API_URI.EXPORT_USERS, {}, function(resp){
    if (resp && resp.list){
      var list = resp.list;
      // common.dlog(list);
      var len = list.length;
      //compose CSV
      var writeContent = 'Name,Email,Phone,Address,Can login,Signup,Login first time,Last active, Last deactive,Groups,Note\n';
      var values;
      for (var i=0; i<len; i++){
        values = list[i];
        if (!common.isEmpty(values['address'])){
          values['address'] = values['address'].replace(/,/g, '-');
        } else {
          values['address'] = '';
        }
        if (common.isEmpty(values['note'])){
          values['note'] = '';
        }
        writeContent += values['name']+','+values['email']+','+values['phone_number']+','+values['address']+','+
        values['can_login']+','+values['created_time']+','+values['login_first_time']+','+values['last_active']+','+
        values['last_deactive']+','+values['groups']+','+values['note']+'\n';
      }
      window.open('data:text/csv;charset=utf-8,' + writeContent);
    } else {
      common.show_alert('No data');
    }
    submitting = false;
  }, function(err){
    common.show_alert(STR_MESS_FRONT.SERVER_ERROR);
    submitting = false;
  });
};

//show verify link, if any
AdminUser.prototype.show_verify_link = function(email, token){
  var $modal_verify_link = $('#modal_verify_link');
  if (!$modal_verify_link.is(':hidden')){
    return;
  }
  $('#div_verify_email', $modal_verify_link).text(email);
  $('#div_verify_link', $modal_verify_link).text('http://vintrade.pro/user/verify_email/'+token);
};
//show verify when delete user, if any
AdminUser.prototype.show_verify_delete = function(row){
  if (submitting){
      return;
  }
  var $tr = $(row).closest('.tr');
  var confirmed = confirm('Do you want to delete this user: ' + $.trim($('.txt_email', $tr).val()));
  if (!confirmed){
    return;
  }
  submitting = true;
  common.ajaxPost(ADMIN_API_URI.DEACTIVATE_USER, {user_id: $tr.attr('data-id')}, function(resp){
    $tr.remove();
    //reduce total number
    var old_total = parseInt($('#total').text());
    if (old_total > 0){
      $('#total').text(old_total-1);
    }
    submitting = false;
  }, function(err){
    common.show_alert(STR_MESS_FRONT.SERVER_ERROR);
    submitting = false;
  });
};
//change admin password
AdminUser.prototype.change_password_admin = function(row){
  if (submitting){
      return;
  }
  var new_pass = $.trim($('#txt_new_pass').val());
  var new_pass_confirm = $.trim($('#txt_new_pass_confirm').val());
  if (new_pass.length < 6){
    common.show_alert("Please input valid password with 6 characters at least");
    return;
  } else if (new_pass != new_pass_confirm){
    common.show_alert("Password not matched!");
    return;
  }
  var params = {
    new_pass: sha256(new_pass)
  };
  submitting = true;
  common.ajaxPost(ADMIN_API_URI.CHANGE_ADMIN_PASSWORD, params, function(resp){
    common.show_alert("Password is updated successfully!");
    $('#txt_new_pass').val('');
    $('#txt_new_pass_confirm').val('');
    submitting = false;
  }, function(err){
    common.show_alert(STR_MESS_FRONT.SERVER_ERROR);
    submitting = false;
  });
};
