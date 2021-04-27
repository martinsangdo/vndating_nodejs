/**
 * author: Viet Ngo
 Manage login
 */
//========== CLASS
function Login() {}

//post login data
Login.prototype.doLogin= function () {
  const form = $("#form-login");
  let params = common.getFormData(form);
  const { Email, Password } = params;
  //validate params
  if (!Email || !Password) {
    toastr.error("Vui lòng nhập các trường có *!");
    return false;
  }
  if (!common.isValidEmail(Email)) {
    toastr.error("Email không đúng định dạng!");
    return false;
  }

  params.Email = Email.toLowerCase();
  params.Password = $.sha256(params.Password)
  common.ajaxPost(API_URI.DO_LOGIN, params, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      toastr.success("Đăng nhập thành công!");
      common.authenticate(resp.data, () => {
        common.redirect("/");
      })
    } else {
      toastr.error(resp.message);
    }
  });
};

//==========
var login = new Login(); //global object
