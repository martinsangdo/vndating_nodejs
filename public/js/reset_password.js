/**
 * author: Viet Ngo
 Manage Reset Password
 */
//========== CLASS
function ResetPassword() {}

var isSubmitting = false;

//post reset-password data
ResetPassword.prototype.doResetPassword = function () {
  const form = $("#form-reset-password");
  let params = common.getFormData(form);
  const { Password, RePassword } = params;
  //validate params
  if (!Password || !RePassword) {
    toastr.error("Vui lòng nhập các trường có *!");
    return false;
  }
  if (Password.length < 8) {
    toastr.error("Mật khẩu phải có từ 8 ký tự!");
    return false;
  }
  if (Password != RePassword) {
    toastr.error("Mật khẩu xác nhận không đúng!");
    return false;
  }

  params.RePassword = undefined;

  if (isSubmitting) {
    return;
  }
  isSubmitting = true;

  common.ajaxPost(API_URI.DO_RESET_PASSWORD, params, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      toastr.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        common.redirect("/user/login");
      }, 1000);
    } else {
      toastr.error(resp.message);
    }
    isSubmitting = false;
  });
};

//==========
var resetPassword = new ResetPassword(); //global object
