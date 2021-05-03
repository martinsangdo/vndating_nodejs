/**
 * author: Martin SangDo
 Manage profile
 */
//========== CLASS
function ProfileClass() {}

var isHashEmail = true;

//get profile data
ProfileClass.prototype.doGetProfile = function () {
  const user = common.isAuth();
  const url =
    API_URI.DO_GET_PROFILE_DATA + "/" + $("#profile-id").val() + "/" + user._id;
  common.ajaxRawGetWithJwt(url, user.token, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      isHashEmail = resp.data.isHashEmail;
      $("#profile-email").val(resp.data.Email);
      if (common.isset(resp.data['Picture'])){
          $('#img_profile').attr('src', API_URI.HENHO_DOMAIN + resp.data['Picture']);
      }
      if (isHashEmail) {
        //encrypted
        let href = user ? "/subscribe" : "/user/login";
        href += "?backURL=" + window.location.href;
        $("#btn-contact").removeClass("hidden").find("a").attr("href", href);
        $("#btn-copy-email").addClass("hidden");
      } else {
        //unblocked
        $("#btn-contact").addClass("hidden");
        $("#btn-copy-email").removeClass("hidden");
          $("#email_warning").removeClass("hidden");
      }
    } else {
      toastr.error(resp.message);
    }
  });
};
//
ProfileClass.prototype.copy_email = function () {
    $('#profile-email').removeAttr('disabled');
    $('#profile-email').select();
    document.execCommand("copy");
    $('#profile-email').attr('disabled', true);
    $('#copy_status').removeClass('hidden');
};

//show info of user
ProfileClass.prototype.show_info = function () {
  const MariedStatus = $("#MariedStatus").attr("data-value");
  $("#MariedStatus")
    .text(common.convert_married_status(MariedStatus))
    .attr("href", `/?page=1&MariedStatus=${MariedStatus}`);
  const Objective = $("#MariedStatus").attr("data-value");
  $("#Objective")
    .text(common.convert_objective(Objective))
    .attr("href", `/?page=1&Objective=${Objective}`);
  const Province = $("#Province").attr("data-value");
  $("#Province")
    .text(common.convert_province(Province))
    .attr("href", `/?page=1&Province=${Province}`);
  $("#Degree").text(common.convert_degree($("#Degree").attr("data-value")));
  $("#Sex").text(common.convert_gender($("#Sex").attr("data-value")));
};
//search related users which having same gender/marital status/objective/province
ProfileClass.prototype.search_related_users = function () {
  common.ajaxRawGet(
    API_URI.SAME_RELATED_PROFILE +
      "?marital=" +
      $("#MariedStatus").attr("data-value") +
      "&objective=" +
      $("#Objective").attr("data-value") +
      "&province=" +
      $("#Province").attr("data-value") +
      "&sex=" +
      $("#Sex").attr("data-value"),
    function (resp) {
      //show them in UI
      if (resp["marital"] != null) {
        fetch_related_user_profile(
          $("#same_marital_status_container"),
          resp["marital"]["data"]
        );
      }
      if (resp["objective"] != null) {
        fetch_related_user_profile(
          $("#same_objective_container"),
          resp["objective"]["data"]
        );
      }
      if (resp["province"] != null) {
        fetch_related_user_profile(
          $("#same_province_container"),
          resp["province"]["data"]
        );
      }
      if (resp["sex"] != null) {
        fetch_related_user_profile(
          $("#same_gender_container"),
          resp["sex"]["data"]
        );
      }
    }
  );
};
//
function fetch_related_user_profile($container, list) {
  if (list == null) {
    return;
  }
  var $tmpl;
  for (var i = 0; i < list.length; i++) {
    $tmpl = $("#user_item_tmpl").clone(false);
    $(".avatar", $tmpl).attr("src", API_URI.HENHO_DOMAIN + list[i]["Picture"]);
    $(".avatar_link", $tmpl).attr(
      "href",
      common.compose_profile_link(list[i]["_id"], list[i]["Name"])
    );
    $(".description", $tmpl).text(list[i]["LookingFor"]);
    $(".description", $tmpl).attr(
      "href",
      common.compose_profile_link(list[i]["_id"], list[i]["Name"])
    );
    $container.append($tmpl.removeAttr("id").removeClass("hidden"));
  }
}
//==========
var profileClass = new ProfileClass(); //global object
