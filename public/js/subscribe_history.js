/**
 * author: Viet Ngo
 Manage Subscribe History
 */

//========== CLASS
function SubscribeHistory() {}

//get data home page, called when load page
SubscribeHistory.prototype.init = function () {
  var pageIndex = common.get_url_param("page") || 1; //start from 1
  var params = `?page=${pageIndex}`;
  const user = common.isAuth();
  const url = API_URI.GET_SUBSCRIBE_LIST + "/" + user._id + params;
  common.ajaxRawGetWithJwt(url, user.token, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      //cache the data of 500 users??? dont need, usually they always looking for new person
      renderList(resp.data);
      renderPaging(pageIndex, resp.total, window.location.origin + "/subscribe/history?");
    } else {
    }
  });
};

SubscribeHistory.prototype.doGetMe = function () {
  const user = common.isAuth();
  const url = API_URI.DO_GET_ME + "/" + user._id;
  common.ajaxRawGetWithJwt(url, user.token, function (resp) {
    if (resp.message == CONST.OK_CODE && resp.data != null) {
      const { SubscribeTimeLive } = resp.data;
      const SubscribeTimeLiveText = SubscribeTimeLive
        ? common.convert_unix_to_date(SubscribeTimeLive)
        : "";
      $("#SubscribeTimeLive").text(SubscribeTimeLiveText);
    } else {
      toastr.error(resp.message);
    }
  });
};

//private
function renderList(list) {
  if (list.length == 0) {
    return;
  }
  var $tmpl;
  var $container = $("#home_list");
  var len = list.length;
  for (var i = 0; i < len; i++) {
    $tmpl = $("#item_tmpl").clone(false);
    $(".MCardCode", $tmpl).text(list[i]["MCardCode"]);
    $(".CreatedTime", $tmpl).text(
      common.convert_unix_to_date(list[i]["CreatedTime"])
    );
    const mCardVendors = MCARD_VENDORS;
    const findMCardVendor = Object.keys(mCardVendors).find(
      (item) => item == list[i]["MCardVendor"]
    );
    const findMCardPackage = MCARD_PACKAGES.find(
      (item) => item.value == list[i]["MCardAmount"]
    );
    $(".card-data", $tmpl).text(
      `Loại thẻ ${findMCardVendor} mệnh giá ${findMCardPackage.label}`
    );

    $container.append($tmpl.removeAttr("id").removeClass("hidden"));
  }
}
//show max 5 pages on left & right
function renderPaging(page_index, total, base_url) {
  if (total == 0 || total == null || total == "") {
    return;
  }
  page_index = parseInt(page_index);
  if (isNaN(page_index) || page_index < 0) {
    page_index = 1; //for showing in UI
  }
  //get total of page
  var total_page = Math.max(
    Math.floor(total / CONST.DEFAULT_PAGE_LEN),
    Math.ceil(total / CONST.DEFAULT_PAGE_LEN)
  );
  if (page_index > total_page) {
    page_index = total_page;
  }
  var $paging_tmpl = "#paging_tmpl";
  var $paging_list = $("#paging_list");
  var min, max, $item_tmpl; //page index
  //show left side
  max = page_index - 1;
  min = max - CONST.PAGE_OFFSET_DISPLAY;
  if (min > 1) {
    appendPagingIndex(
      1,
      1,
      total_page,
      $paging_tmpl,
      $paging_list,
      ".li_normal",
      base_url
    ); //show page 1
  }
  if (min > 2) {
    appendPagingDot($paging_tmpl, $paging_list, ".li_normal", base_url);
  }
  appendPagingIndex(
    min,
    max,
    total_page,
    $paging_tmpl,
    $paging_list,
    ".li_normal",
    base_url
  );
  //show active item
  appendPagingIndex(
    page_index,
    page_index,
    total_page,
    $paging_tmpl,
    $paging_list,
    ".li_active",
    base_url
  );
  //show right side
  min = page_index + 1;
  max = min + CONST.PAGE_OFFSET_DISPLAY;
  appendPagingIndex(
    min,
    max,
    total_page,
    $paging_tmpl,
    $paging_list,
    ".li_normal",
    base_url
  );
  if (max + 1 < total_page) {
    appendPagingDot($paging_tmpl, $paging_list, ".li_normal", base_url);
  }
  if (max < total_page) {
    appendPagingIndex(
      total_page,
      total_page,
      total_page,
      $paging_tmpl,
      $paging_list,
      ".li_normal",
      base_url
    );
  }
  $("#paging_list").removeClass("hidden");
}
//
function appendPagingIndex(
  min,
  max,
  total_page,
  $paging_tmpl,
  $paging_list,
  item_class,
  base_url
) {
  var $item_tmpl;
  for (var i = min; i <= max; i++) {
    if (i < 1 || i > total_page) {
      continue;
    }
    $item_tmpl = $(item_class, $paging_tmpl).clone(false);
    $("a", $item_tmpl).text(i);
    $("a", $item_tmpl).attr("href", base_url + "page=" + i);
    $paging_list.append($item_tmpl);
  }
}
//
function appendPagingDot($paging_tmpl, $paging_list, item_class, base_url) {
  var $item_tmpl = $(item_class, $paging_tmpl).clone(false);
  $("a", $item_tmpl).text("...");
  $paging_list.append($item_tmpl);
}
//==========
var subscribeHistory = new SubscribeHistory(); //global object
