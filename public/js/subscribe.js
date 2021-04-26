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
        location.reload();
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

  //mask to verify card code
  $("#MCardCode").mask("9999-9999-9999");
};

//==========
var subscribe = new Subscribe(); //global object
