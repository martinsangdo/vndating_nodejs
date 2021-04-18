/**
 * author: Viet Ngo
 Manage signup
 */
//========== CLASS
function Signup() {}

//post signup data
Signup.prototype.doSignup = function () {
  //check captcha
  const captcha = $("#g-recaptcha-response").val();
  if (!captcha || captcha === "") {
    toastr.error("Captcha không đúng!");
    return false;
  }

  const form = $("#form-signup");
  let params = common.getFormData(form);
  const { LastName, FirstName, Email, Password, RePassword } = params;
  //validate params
  if (!LastName || !FirstName || !Email || !Password || !RePassword) {
    toastr.error("Vui lòng nhập các trường có *!");
    return false;
  }
  if (!common.isValidEmail(Email)) {
    toastr.error("Email không đúng định dạng!");
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

  params.rePassword = undefined;
  params.Name = FirstName + " " + LastName;
  params.Email = Email.toLowerCase();
  common.ajaxPost(API_URI.DO_SIGNUP, params, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      toastr.success("Đăng ký thành công!");
      setTimeout(() => {
        common.redirect("/");
      }, 1000);
    } else {
      toastr.error(resp.message);
    }
  });
};

//==========
var signup = new Signup(); //global object
