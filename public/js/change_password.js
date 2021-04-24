/**
 * author: Viet Ngo
 Manage change password
 */
//========== CLASS
function ChangePassword() {}

var isSubmitting = false;

//post signup data
ChangePassword.prototype.doChangePassword = function () {
  const form = $("#form-change-password");
  let params = common.getFormData(form);
  const { Password, NewPassword, NewRePassword } = params;
  //validate params
  if (!Password || !NewPassword || !NewRePassword) {
    toastr.error("Vui lòng nhập các trường có *!");
    return false;
  }
  if (NewPassword.length < 8) {
    toastr.error("Mật khẩu mới phải có từ 8 ký tự!");
    return false;
  }
  if (NewPassword != NewRePassword) {
    toastr.error("Mật khẩu mới xác nhận không đúng!");
    return false;
  }

  params.NewRePassword = undefined;

  if (isSubmitting) {
    return;
  }
  isSubmitting = true;

  const user = common.isAuth();
  const url = API_URI.DO_CHANGE_PASSWORD + "/" + user._id;
  common.ajaxPostWithJwt(url, params, user.token, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      toastr.success("Đổi mật khẩu thành công!");
      form[0].reset();
    } else {
      toastr.error(resp.message);
    }
    isSubmitting = false;
  });
};

//==========
var changePassword = new ChangePassword(); //global object
