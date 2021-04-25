/**
 * author: Viet Ngo
 Manage forgot password
 */
//========== CLASS
function ForgotPassword() {}

var isSubmitting = false;

//post login data
ForgotPassword.prototype.doForgotPassword = function () {
  const form = $("#form-forgot-password");
  let params = common.getFormData(form);
  const { Email } = params;
  //validate params
  if (!Email) {
    toastr.error("Vui lòng nhập các trường có *!");
    return false;
  }
  if (!common.isValidEmail(Email)) {
    toastr.error("Email không đúng định dạng!");
    return false;
  }

  params.Email = Email.toLowerCase();
  
  if (isSubmitting) {
    return;
  }
  isSubmitting = true;

  common.ajaxPost(API_URI.DO_FORGOT_PASSWORD, params, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      toastr.success(
        "Một email đã được gửi. Vui lòng làm theo hướng dẫn để đặt lại mật khẩu của bạn."
      );
      form[0].reset();
    } else {
      toastr.error(resp.message);
    }
    isSubmitting = false
  });
};

//==========
var forgotPassword = new ForgotPassword(); //global object