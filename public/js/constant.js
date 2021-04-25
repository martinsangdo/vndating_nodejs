/*
author: Martin SangDo
 */
//API URI
var STR_MESS_FRONT = {
  CREATE_SUCCESS: "Created successfully",
  UPDATE_SUCCESS: "Updated successfully",
  MISSING_INPUT: "Missing required fields",
  SERVER_ERROR: "Something wrong, please try it another time",
  PROCESSING: "Processing, please wait a moment...",
  INVALID_EMAIL: "Email is invalid",
  EMAIL_IS_EXISTED: "Email was used by another user",
  EMPTY_SELECTED_ITEMS: "Please select some items",
};
//link of APIs
var API_URI = {
  HENHO_DOMAIN: "",
  HOME_LIST: "/user/get_homepage_list",
  RANDOM_USER: "/user/random_user_by_gender",
  FRONT_LOGIN: "/publicapi/front_login", //prevent access before publishing
  SAME_RELATED_PROFILE: "/user/same_related_profile",
  DO_SIGNUP: "/user/signup",
  DO_LOGIN: "/user/login",
  DO_LOGOUT: "/user/logout",
  DO_FORGOT_PASSWORD: "/user/forgot_password",
  DO_RESET_PASSWORD: "/user/reset_password",
  DO_CREATE_SUBSCRIBE: "/subscribe/create",
  DO_GET_PROFILE_DATA: "/user/profile_data",
  DO_CHANGE_PASSWORD: "/user/change_password",
  DO_GET_ME: "/user/me",
  DO_UPDATE_ME: "/user/me",
};

var CONST = {
  OK_CODE: "OK",
  DEFAULT_PAGE_LEN: 10, //no. of items in pagination
  PAGE_OFFSET_DISPLAY: 4, //show items in left/right of active index
  HIDDEN_CLASSNAME: "hidden",
  //input form
  FORM_GROUP_CLASS: ".form-group",
  FROM_INPUT_ERROR_CLASSNAME: "u-has-error-v3", //form-group which has error
  INPUT_ERROR_CLASSNAME: "g-brd-pink-v2--error",
  //
  PROCESS_DONE_NAV_TIMEOUT: 3000, //the duration (seconds) after a form was finished, moving to new page in (x) seconds
  //message/error labels, used in input forms
  LBL_MESS: "#lbl_mess",
  LBL_MESS_CUSTOM: "#lbl_mess_custom",
  LBL_MESS_ERROR_CLASSNAME: "g-color-red",
  LBL_MESS_INFO_CLASSNAME: "g-color-green",
};
//response message
var RESP_MESS = {
  DUPLICATE_RECORD: "DUPLICATE_RECORD",
  PAYMENT_EMPTY: "PAYMENT_EMPTY",
  PAYMENT_NOT_EMPTY: "PAYMENT_NOT_EMPTY",
  USER_IS_NOT_EXISTED: "USER_IS_NOT_EXISTED",
};

var MCARD_VENDORS = {
  GTEL: "Gtel",
  MOBIFONE: "Mobifone",
  VIETNAMOBILE: "Vietnamobile",
  VIETTEL: "Viettel",
  VINAPHONE: "Vinaphone",
};
var MCARD_PACKAGES = [
  {
    id: 1,
    value: 20000, //vnd
    label: "20k",
    duration: 10, //day
  },
  {
    id: 2,
    value: 50000,
    label: "50k",
    duration: 30,
  },
  {
    id: 3,
    value: 100000,
    label: "100k",
    duration: 60,
  },
  {
    id: 4,
    value: 200000,
    label: "200k",
    duration: 180,
  },
  {
    id: 3,
    value: 500000,
    label: "500k",
    duration: 730,
  },
];
