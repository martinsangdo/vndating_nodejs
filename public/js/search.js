/**
 * author: Viet Ngo
 Manage search
 */
//========== CLASS
function Search() {}

//get data home page, called when load page
Search.prototype.getSearchResult = function () {
  var pageIndex = common.get_url_param("page") || 1; //start from 1
  var MariedStatus = common.get_url_param("MariedStatus") || "";
  var Objective = common.get_url_param("Objective") || "";
  var Province = common.get_url_param("Province") || "";
  var Sex = common.get_url_param("Sex") || "";
  var AgeFrom = common.get_url_param("AgeFrom") || "";
  var AgeTo = common.get_url_param("AgeTo") || "";
  var params = `?page=${pageIndex}&MariedStatus=${MariedStatus}&Objective=${Objective}&Province=${Province}&Sex=${Sex}&AgeFrom=${AgeFrom}&AgeTo=${AgeTo}`;
  common.ajaxRawGet(API_URI.HOME_LIST + params, function (resp) {
    if (resp.result == CONST.OK_CODE && resp.data != null) {
      //cache the data of 500 users??? dont need, usually they always looking for new person
      renderHomeList(resp.data);
      renderPaging(pageIndex, resp.total, window.location.origin + "/search?");
    } else {
    }
  });

  //display on search form
  const formSearch = $("#form-search");
  if (MariedStatus || MariedStatus == 0) {
    formSearch.find("select[name=MariedStatus]").val(MariedStatus);
  }
  if (Objective || Objective == 0) {
    formSearch.find("select[name=Objective]").val(Objective);
  }
  if (Province || Province == 0) {
    formSearch.find("select[name=Province]").val(Province);
  }
  if (Sex || Sex == 0) {
    formSearch.find("select[name=Sex]").val(Sex);
  }
  if (AgeFrom) {
    formSearch.find("select[name=AgeFrom]").val(AgeFrom);
  }
  if (AgeTo) {
    formSearch.find("select[name=AgeTo]").val(AgeTo);
  }
};
//private
function renderHomeList(list) {
  if (list.length == 0) {
    return;
  }
  var pageIndex = 1; //start from 1
  var $tmpl;
  var $container = $("#home_list");
  var len = list.length;
  for (var i = 0; i < len; i++) {
    $tmpl = $("#person_tmpl").clone(false);
    $(".home_img_thumb", $tmpl).attr(
      "src",
      API_URI.HENHO_DOMAIN + list[i]["Picture"]
    );
    $(".home_img_thumb", $tmpl).attr(
      "onclick",
      'window.location.href="' +
        common.compose_profile_link(list[i]["_id"], list[i]["Name"]) +
        '"'
    );
    $(".data-gender", $tmpl).text(common.convert_gender(list[i]["Sex"]));
    $(".data-gender", $tmpl).addClass(
      common.convert_gender_color(list[i]["Sex"])
    );
    $(".data-looking-for", $tmpl).text(list[i]["LookingFor"]);
    $(".data-name", $tmpl).text(list[i]["Name"]);
    $(".data-name", $tmpl).attr(
      "href",
      common.compose_profile_link(list[i]["_id"], list[i]["Name"])
    );
    $(".data-province", $tmpl)
      .text(common.convert_province(list[i]["Province"]))
      .attr("href", `?page=${pageIndex}&Province=${list[i]["Province"]}`);
    $(".data-age", $tmpl).text(list[i]["Age"]);
    $(".data-married-status", $tmpl)
      .text(common.convert_married_status(list[i]["MariedStatus"]))
      .attr(
        "href",
        `?page=${pageIndex}&MariedStatus=${list[i]["MariedStatus"]}`
      );
    $(".data-objective", $tmpl)
      .text(common.convert_objective(list[i]["Objective"]))
      .attr("href", `?page=${pageIndex}&Objective=${list[i]["Objective"]}`);
    $(".data-date", $tmpl).text(
      common.convert_unix_to_date(list[i]["updated_time"])
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
  var MariedStatus = common.get_url_param("MariedStatus") || "";
  var Objective = common.get_url_param("Objective") || "";
  var Province = common.get_url_param("Province") || "";
  var Sex = common.get_url_param("Sex") || "";
  var AgeFrom = common.get_url_param("AgeFrom") || "";
  var AgeTo = common.get_url_param("AgeTo") || "";
  var params = `&MariedStatus=${MariedStatus}&Objective=${Objective}&Province=${Province}&Sex=${Sex}&AgeFrom=${AgeFrom}&AgeTo=${AgeTo}`;
  for (var i = min; i <= max; i++) {
    if (i < 1 || i > total_page) {
      continue;
    }
    $item_tmpl = $(item_class, $paging_tmpl).clone(false);
    $("a", $item_tmpl).text(i);
    $("a", $item_tmpl).attr("href", base_url + "page=" + i + params);
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
var search = new Search(); //global object
