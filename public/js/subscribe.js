/**
 * author: Viet Ngo
 Manage subscribe
 */
//========== CLASS
function Subscribe() {}

//post subscribe data
Subscribe.prototype.doCreateSubscribe = function () {
  const form = $("#form-subscribe");
  let params = common.getFormData(form);
  const { MCardVendor, MCardPackage, MCardCode } = params;
  //validate params
  if (!MCardVendor || !MCardPackage || !MCardCode) {
    toastr.error("Vui lòng nhập các trường có *!");
    return false;
  }
  // if (!common.isValidCardCode(MCardCode)) {
  //   toastr.error("Thẻ cào không đúng định dạng!");
  //   return false;
  // }

  const findMCardPackage = MCARD_PACKAGES.find(
    (item) => item.id == MCardPackage
  );
  params.MCardAmount = findMCardPackage.value;
  params.MCardDuration = findMCardPackage.duration;
  params.MCardCode = $.trim(MCardCode.toUpperCase());
  const user = common.isAuth();
  const url = API_URI.DO_CREATE_SUBSCRIBE + "/" + user._id;
  common.ajaxPostWithJwt(url, params, user.token, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      toastr.success("Lưu thành công!");
      setTimeout(() => {
        common.redirect($("#backURL").val() || "/");
      }, 1000);
    } else {
      toastr.error(resp.message);
    }
  });
};

Subscribe.prototype.init = () => {
  var mcardVendors = MCARD_VENDORS;
  var vendorData = Object.keys(mcardVendors).map(
    (index) => `<option value="${index}">${mcardVendors[index]}</option>`
  );
  $("#mcard-vendor").html(vendorData);

  var packageData = MCARD_PACKAGES.map(
    (item, index) => `<option value="${item.id}">${item.label}</option>`
  );
  $("#mcard-package").html(packageData);
};

Subscribe.prototype.validateCardCode = (evt) => {
  var theEvent = evt || window.event;

  // Handle paste
  if (theEvent.type === "paste") {
    key = event.clipboardData.getData("text/plain");
  } else {
    // Handle key press
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
  }
  var regex = /[0-9]|\./;
  if (!regex.test(key) && key !== '-') {
    theEvent.returnValue = false;
    if (theEvent.preventDefault) theEvent.preventDefault();
  }
};

//==========
var subscribe = new Subscribe(); //global object
