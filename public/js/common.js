/*
author: Martin SangDo
//used in all pages
 */
var submitting = false;
const SERVER_URI =
  window.location.protocol +
  "//" +
  window.location.hostname +
  ":" +
  window.location.port +
  "";

//========== CLASS
function Common() {}

var common = new Common(); //global object

Common.prototype.dlog = function (mess) {
  if (!this.isEmpty(mess) && console.log) {
    //avoid IE
    console.log(mess);
  }
};
//
Common.prototype.isEmpty = function (a_var) {
  return a_var === undefined || a_var == null || $.trim(a_var) == "";
};
//
Common.prototype.get_timestamp_sec = function () {
    return Math.round(Date.now() / 1000);
};
//
Common.prototype.isset = function (a_var) {
  return !this.isEmpty(a_var);
};
//
Common.prototype.ajaxPost = function (uri, params, callback, callback_err) {
  uri = encodeURI(SERVER_URI + uri);

  $.ajax({
    url: uri, //url is a link request
    type: "POST",
    data: params, //data send to server
    dataType: "json", //jsonp causes error in IE
    success: function (msg) {
      if (callback !== undefined) {
        callback(msg);
      }
    },
    error: function (errormessage) {
      if (callback_err !== undefined) {
        callback_err(errormessage.responseText);
      }
    },
  });
};
//get data from URL
Common.prototype.ajaxRawGet = function (url, callback, callback_err) {
  $.ajax({
    url: url, //url is a link request
    type: "GET",
    dataType: "json", //jsonp causes error in IE
    success: function (msg) {
      // console.log(url)
      // console.log(msg['result'])
      if (callback !== undefined && msg['result'] != null) {
        callback(msg['result']);
      }
    },
    error: function (errormessage) {
      if (callback_err !== undefined) {
        callback_err(errormessage.responseText);
      }
    },
  });
};
//get data from URL with JWT
Common.prototype.ajaxRawGetWithJwt = function (
  url,
  token,
  callback,
  callback_err
) {
  $.ajax({
    url: url, //url is a link request
    type: "GET",
    dataType: "json", //jsonp causes error in IE
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", `Bearer ${token}`);
    },
    success: function (msg) {
      if (callback !== undefined) {
        callback(msg);
      }
    },
    error: function (errormessage) {
      if (callback_err !== undefined) {
        callback_err(errormessage.responseText);
      }
    },
  });
};
//ajaxPost with JWT
Common.prototype.ajaxPostWithJwt = function (
  uri,
  params,
  token,
  callback,
  callback_err
) {
  uri = encodeURI(SERVER_URI + uri);

  $.ajax({
    url: uri, //url is a link request
    type: "POST",
    data: params, //data send to server
    dataType: "json", //jsonp causes error in IE
    beforeSend: function (request) {
      request.setRequestHeader("Authorization", `Bearer ${token}`);
    },
    success: function (msg) {
      if (callback !== undefined) {
        callback(msg);
      }
    },
    error: function (errormessage) {
      if (callback_err !== undefined) {
        callback_err(errormessage.responseText);
      }
    },
  });
};
//
Common.prototype.redirect = function (url) {
  window.location.href = url;
};
//
Common.prototype.isValidEmail = function (email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
};
//
Common.prototype.isValidPhone = function (phone) {
  var regex = /[0-9 -()+]+$/;
  return regex.test(phone);
};
//
Common.prototype.format_date = function (d) {
  return (
    d.getFullYear() +
    "-" +
    (d.getMonth() + 1) +
    "-" +
    d.getDate() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes() +
    ":" +
    d.getSeconds()
  );
};
//format short date
Common.prototype.format_short_date = function (d) {
  return d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
};
//show alert
Common.prototype.show_alert = function (mess) {
  alert(mess);
};
//generate random string
Common.prototype.rand_str = function () {
  return Math.random().toString(36).substring(2).toUpperCase();
};
//get value from url parameters
Common.prototype.get_url_param = function (param_name) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] === param_name) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
  return "";
};
//check the string end with a string
Common.prototype.is_endWidth = function (str, postfix) {
  return (
    str
      .toLowerCase()
      .indexOf(postfix.toLowerCase(), str.length - postfix.length) !== -1
  );
};
//generate UUID
Common.prototype.generateUUID = function (str, postfix) {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
//
Common.prototype.isValidUrl = function (url) {
  var regexp = /^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
  return regexp.test(url);
};
//convert movie speed to readable string
Common.prototype.format_speed_2_string = function (byte_value) {
  if (byte_value == null || byte_value == "" || byte_value == 0) {
    return "";
  }
  var kb_result = 0;
  byte_value = parseInt(byte_value);
  if (byte_value < 1000000) {
    //less than 1 MB
    kb_result = byte_value / 1000;
    return kb_result.toFixed(1) + " kb/s";
  } else {
    kb_result = byte_value / 1000000;
    return kb_result.toFixed(1) + " Mb/s";
  }
};
//convert unix timestamp to date string
Common.prototype.convert_unix_to_date = function (unixTimestamp) {
  var d = new Date(unixTimestamp * 1000);
  return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
};
//convert unix timestamp to datetime string
Common.prototype.convert_unix_to_datetime = function (unixTimestamp) {
  if (unixTimestamp == null || unixTimestamp == '' || unixTimestamp === undefined){
    return '';
  }
  var d = new Date(unixTimestamp * 1000);
  return (
    d.getDate() +
    "/" +
    (d.getMonth() + 1) +
    "/" +
    d.getFullYear() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes() +
    ":" +
    d.getSeconds()
  );
};
//
Common.prototype.convert_province = function (code, isGetAll = false) {
  var data = {
    58: "TP Hồ Chí Minh",
    24: "Hà Nội",
    15: "Đà Nẵng",
    1: "An Giang",
    2: "Bà Rịa - Vũng Tàu",
    3: "Bắc Giang",
    4: "Bắc Kạn",
    5: "Bạc Liêu",
    6: "Bắc Ninh",
    7: "Bến Tre",
    8: "Bình Định",
    9: "Bình Dương",
    10: "Bình Phước",
    11: "Bình Thuận",
    12: "Cà Mau",
    13: "Cần Thơ",
    14: "Cao Bằng",
    16: "Đăk Lăk",
    17: "Đăk Nông",
    18: "Điện Biên",
    19: "Đồng Nai",
    20: "Đồng Tháp",
    21: "Gia Lai",
    22: "Hà Giang",
    23: "Hà Nam",
    25: "Hà Tĩnh",
    26: "Hải Dương",
    27: "Hải Phòng",
    28: "Hậu Giang",
    29: "Hoà Bình",
    30: "Hưng Yên",
    31: "Khánh Hòa",
    32: "Kiên Giang",
    33: "Kon Tum",
    34: "Lai Châu",
    35: "Lâm Đồng",
    36: "Lạng Sơn",
    37: "Lào Cai",
    38: "Long An",
    39: "Nam Định",
    40: "Nghệ An",
    41: "Ninh Bình",
    42: "Ninh Thuận",
    43: "Phú Thọ",
    44: "Phú Yên",
    45: "Quảng Bình",
    46: "Quảng Nam",
    47: "Quảng Ngãi",
    48: "Quảng Ninh",
    49: "Quảng Trị",
    50: "Sóc Trăng",
    51: "Sơn La",
    52: "Tây Ninh",
    53: "Thái Bình",
    54: "Thái Nguyên",
    55: "Thanh Hóa",
    56: "Thừa Thiên-Huế",
    57: "Tiền Giang",
    59: "Trà Vinh",
    60: "Tuyên Quang",
    61: "Vĩnh Long",
    62: "Vĩnh Phúc",
    63: "Yên Bái",
  };
  return isGetAll ? data : data[code];
};
//
Common.prototype.convert_gender = function (code, isGetAll = false) {
  var data = {
    0: "Nam",
    1: "Nữ",
    2: "Gay",
    3: "Les",
  };
  return isGetAll ? data : data[code];
};
//
Common.prototype.convert_gender_color = function (code, isGetAll = false) {
  var data = {
    0: "u-btn-aqua",
    1: "u-btn-pink",
    2: "u-btn-orange",
    3: "u-btn-purple",
  };
  return isGetAll ? data : data[code];
};
//
Common.prototype.convert_objective = function (code, isGetAll = false) {
  var data = {
    0: "Người yêu lâu dài",
    1: "Người yêu ngắn hạn",
    2: "Tìm bạn bè mới",
    3: "Tìm bạn tâm sự",
  };
  return isGetAll ? data : data[code];
};
//
Common.prototype.convert_married_status = function (code, isGetAll = false) {
  var data = {
    0: "Độc thân",
    1: "Đang có người yêu",
    2: "Đã có gia đình",
    3: "Ly dị",
    4: "Ở góa",
  };
  return isGetAll ? data : data[code];
};
//
Common.prototype.convert_degree = function (code, isGetAll = false) {
  var data = {
    0: "Phổ thông",
    1: "Trung Cấp",
    2: "Cao đẳng",
    3: "Đại học",
    4: "Thạc sĩ",
    5: "Tiến sĩ",
    6: "Giáo sư",
  };
  return isGetAll ? data : data[code];
};
//
Common.prototype.compose_profile_link = function (id, name) {
  return "/user/profile/" + id + "/" + name;
};
//get formData
Common.prototype.getFormData = function (form) {
  var unindexedArray = form.serializeArray();
  var indexedArray = {};

  $.map(unindexedArray, function (n, i) {
    indexedArray[n["name"]] = n["value"];
  });

  return indexedArray;
};

//authenticate
Common.prototype.authenticate = (data, next) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(data));
    next();
  }
};

//check authenticate
Common.prototype.isAuth = () => {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : false;
};

//logout
Common.prototype.doLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    common.ajaxPost(API_URI.DO_LOGOUT);
    common.redirect("/");
  }
};

//submit form search
Common.prototype.handleClickSearch = () => {
  const formSearch = $("#form-search");
  let params = common.getFormData(formSearch);
  const { AgeTo, AgeFrom } = params;
  if (parseInt(AgeFrom) > parseInt(AgeTo)) {
    toastr.error("Tuổi đến phải lớn hơn tuổi từ!");
    return false;
  }
  formSearch.submit();
};

//common functions
$(function () {
  //toggle button menu
  $("#btn-toggle-nav").click(function () {
    $("#navBar").toggleClass("show");
  });

  var userMenu = $("#user-menu");
  var html = "";
  const user = common.isAuth();
  if (user) {
    $("#auth-menu").removeClass("hidden");
    $("#unauth-menu").addClass("hidden");
  } else {
    $("#auth-menu").addClass("hidden");
    $("#unauth-menu").removeClass("hidden");
  }
  userMenu.html(html);

  //#form-search
  const formSearch = $("#form-search");
  const genders = common.convert_gender(null, true);
  formSearch
    .find("select[name=Sex]")
    .append(
      Object.keys(genders).map(
        (item) => `<option value="${item}">${genders[item]}</option>`
      )
    );
  const mariedStatuses = common.convert_married_status(null, true);
  formSearch
    .find("select[name=MariedStatus]")
    .append(
      Object.keys(mariedStatuses).map(
        (item) => `<option value="${item}">${mariedStatuses[item]}</option>`
      )
    );
  const objectives = common.convert_objective(null, true);
  formSearch
    .find("select[name=Objective]")
    .append(
      Object.keys(objectives).map(
        (item) => `<option value="${item}">${objectives[item]}</option>`
      )
    );
  const provinces = common.convert_province(null, true);
  formSearch
    .find("select[name=Province]")
    .append(
      Object.keys(provinces).map(
        (item) => `<option value="${item}">${provinces[item]}</option>`
      )
    );

  let ageData = "";
  for (i = 18; i <= 75; i++) {
    ageData += `<option value="${i}">${i}</option>`;
  }
  formSearch.find("select[name=AgeFrom]").append(ageData);
  formSearch.find("select[name=AgeTo]").append(ageData);
});
