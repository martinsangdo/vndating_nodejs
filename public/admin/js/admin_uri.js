/*
    API uri of Admin functions
 */
var ADMIN_CONTROLLER = '/admin-control/';
var ADMIN_USER_CONTROLLER_NAME = '/admin-user/';

 var ADMIN_API_URI = {
     //login
     READ_NEW_CAPTCHA: ADMIN_CONTROLLER+ 'read_new_captcha',
     LOGIN: ADMIN_CONTROLLER+ 'check_login',
     LOGOUT: ADMIN_CONTROLLER+ 'logout',
     CHANGE_ADMIN_PASSWORD: ADMIN_CONTROLLER + 'change_password_admin',
     //movie list
     NEW_USER_LIST: ADMIN_USER_CONTROLLER_NAME+'new-user-list-query',
 };
