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
    toastr.error("Vui lòng nhập các ô có *");
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
  $("#btn-submit").attr("disabled", true);

  common.ajaxPost(API_URI.DO_FORGOT_PASSWORD, params, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      toastr.success(
        "Một email đã được gửi. Vui lòng kiểm tra hộp thư hoặc Spam mail để đặt lại mật khẩu của bạn."
      );
      form[0].reset();
    } else {
      toastr.error(resp.message);
    }
    isSubmitting = false;
    $("#btn-submit").attr("disabled", false);
  });
};

//==========
var forgotPassword = new ForgotPassword(); //global object
