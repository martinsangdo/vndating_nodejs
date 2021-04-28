/**
 * author: Viet Ngo
 Manage me
 */
//========== CLASS
function Me() {}

var isSubmitting = false;

//get profile data
Me.prototype.doGetMe = function () {
  const user = common.isAuth();
  const url = API_URI.DO_GET_ME + "/" + user._id;
  common.ajaxRawGetWithJwt(url, user.token, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      const {
        Email,
        LastName,
        FirstName,
        Sex,
        MariedStatus,
        Objective,
        Age,
        Profile,
        LookingFor,
        Height,
        Weight,
        Province,
        Degree,
        Picture,
      } = resp.data;
      $("#Email").val(Email);
      $("#LastName").val(LastName);
      $("#FirstName").val(FirstName);
      $("#Profile").val(Profile);
      $("#LookingFor").val(LookingFor);
      $("#Height").val(Height);
      $("#Weight").val(Weight);
      if (Sex || Sex == 0) {
        $("#Sex").val(Sex);
      }
      if (MariedStatus || MariedStatus == 0) {
        $("#MariedStatus").val(MariedStatus);
      }
      if (Objective || Objective == 0) {
        $("#Objective").val(Objective);
      }
      if (Age) {
        $("#Age").val(Age);
      }
      if (Province || Province == 0) {
        $("#Province").val(Province);
      }
      if (Degree || Degree == 0) {
        $("#Degree").val(Degree);
      }
      if (Picture) {
        $("#Picture").attr("src", Picture);
      }
    } else {
      toastr.error(resp.message);
    }
  });
};

//do update my profile
Me.prototype.doUpdateMe = function () {
  const form = $("#form-me");
  let params = common.getFormData(form);
  const { LastName, FirstName, Email } = params;
  //validate params
  if (!LastName || !FirstName || !Email) {
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

  const user = common.isAuth();
  const url = API_URI.DO_UPDATE_ME + "/" + user._id;
  common.ajaxPostWithJwt(url, params, user.token, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      toastr.success("Lưu thành công!");
      setTimeout(() => {
        location.reload();
      }, 1000);
    } else {
      toastr.error(resp.message);
    }
    isSubmitting = false;
  });
};

Me.prototype.init = () => {
  const genders = common.convert_gender(null, true);
  $("#Sex").append(
    Object.keys(genders).map(
      (item) => `<option value="${item}">${genders[item]}</option>`
    )
  );
  const mariedStatuses = common.convert_married_status(null, true);
  $("#MariedStatus").append(
    Object.keys(mariedStatuses).map(
      (item) => `<option value="${item}">${mariedStatuses[item]}</option>`
    )
  );
  const objectives = common.convert_objective(null, true);
  $("#Objective").append(
    Object.keys(objectives).map(
      (item) => `<option value="${item}">${objectives[item]}</option>`
    )
  );
  const provinces = common.convert_province(null, true);
  $("#Province").append(
    Object.keys(provinces).map(
      (item) => `<option value="${item}">${provinces[item]}</option>`
    )
  );
  const degrees = common.convert_degree(null, true);
  $("#Degree").append(
    Object.keys(degrees).map(
      (item) => `<option value="${item}">${degrees[item]}</option>`
    )
  );

  let ageData = "";
  for (i = 18; i <= 75; i++) {
    ageData += `<option value="${i}">${i}</option>`;
  }
  $("#Age").append(ageData);
};

//==========
var me = new Me(); //global object
