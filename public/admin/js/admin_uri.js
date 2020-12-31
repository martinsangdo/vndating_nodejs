/*
    API uri of Admin functions
 */
var ADMIN_CONTROLLER = '/admin-control/';
var ADMIN_MOVIE_CONTROLLER_NAME = '/admin-movie/';
var ADMIN_CATEGORY_CONTROLLER_NAME = '/admin-category/';
var ADMIN_LANGUAGE_CONTROLLER_NAME = '/admin-language/';
var ADMIN_APP_SETTING_CONTROLLER_NAME = '/admin-app/';

 var ADMIN_API_URI = {
     //login
     READ_NEW_CAPTCHA: ADMIN_CONTROLLER+ 'read_new_captcha',
     LOGIN: ADMIN_CONTROLLER+ 'check_login',
     LOGOUT: ADMIN_CONTROLLER+ 'logout',
     CHANGE_ADMIN_PASSWORD: ADMIN_CONTROLLER + 'change_password_admin',
     //movie list
     MOVIE_LIST: ADMIN_MOVIE_CONTROLLER_NAME+'list',    //page
     GET_MOVIE_LIST: ADMIN_MOVIE_CONTROLLER_NAME + 'paging-list',
     GET_MOVIE_DETAIL: ADMIN_MOVIE_CONTROLLER_NAME + 'movie-detail?id=',
     SAVE_BASIC_MOVIE_DETAIL: ADMIN_MOVIE_CONTROLLER_NAME + 'save-basic-detail',
     SAVE_EXTRA_MOVIE_DETAIL: ADMIN_MOVIE_CONTROLLER_NAME + 'save-extra-detail',
     DELETE_MOVIES: ADMIN_MOVIE_CONTROLLER_NAME + 'delete-movies',
     INSERT_MOVIE: ADMIN_MOVIE_CONTROLLER_NAME + 'insert-movie',
     BULK_UPDATE_MOVIES: ADMIN_MOVIE_CONTROLLER_NAME + 'bulk-update',
     GET_SPEED_DATA: ADMIN_MOVIE_CONTROLLER_NAME + 'speed-data',
     UPDATE_SPEED: ADMIN_MOVIE_CONTROLLER_NAME + 'update-speed',
     //category
     GET_ACTIVE_CATEGORY_LIST: ADMIN_CATEGORY_CONTROLLER_NAME + 'data-list',    //get active movies only
     SAVE_CATEGORY_DETAIL: ADMIN_CATEGORY_CONTROLLER_NAME + 'save-detail',
     //language
     SAVE_LANGUAGE_DETAIL: ADMIN_LANGUAGE_CONTROLLER_NAME + 'save-detail',
     //app settings
     SAVE_APP_SETTING: ADMIN_APP_SETTING_CONTROLLER_NAME + 'save-detail'
 };
