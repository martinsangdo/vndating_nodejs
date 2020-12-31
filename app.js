/**
 * author: Martin
 * @type {*}
 */
var express = require('express');
var path = require('path');
var session = require('express-session');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var restResponse = require('express-rest-response');
var bodyParser = require('body-parser');
var config = require('./config/setting')();
var winston = require('winston');			//keep track Exception of nodejs server, if any
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
//Define routes
var routes = require('./routes/index');
var test = require('./routes/test');
var web_parser = require('./routes/web_parser');
var payment = require('./routes/payment');
var movie = require('./routes/movie');
var admin_control = require('./routes/admin/login');
var admin_movie = require('./routes/admin/movie');
var admin_category = require('./routes/admin/category');
var admin_dashboard = require('./routes/admin/dashboard');
var admin_language = require('./routes/admin/language');
var admin_app = require('./routes/admin/app_setting');

var app = express();
var server = require('http').Server(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(function(req, res, next){
	// res.io = io;
	next();
});
// app.use(logger('dev'));      //display all requests logs
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static('app_data'));		//folder contains resources: images/videos. MUST same as upload_storage_path in seting.js for uploading function
app.set('trust proxy', 1); // trust first proxy
//
// var DB_URL = process.env.MLAB_MONGODB_OTC_URI;	//production
// var DB_URL = 'mongodb+srv://swipexdev2:fiptncjVopaaqAtU@cluster0.fwovj.mongodb.net/swipexdevdb?authSource=admin&replicaSet=atlas-hjcdri-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true';
var DB_URL = 'mongodb://localhost:27017/vndating';
//Connect to mongodb
var connect = function () {
  var options = {
  	socketTimeoutMS: 0,
      keepAlive: true,
      useUnifiedTopology: true,	//able to retry connection
      useNewUrlParser: true,
	  dbName: 'swipexdevdb'};
  mongoose.connect(DB_URL, options);
};
connect();
mongoose.Promise = require('bluebird');
mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);
app.use(session({secret: '3786829b-9f59-41cc-9a70-c1f986b90737',
        saveUninitialized: false,	//prevent overflow
        resave: true,
        cookie: {
            maxAge  : 3600000*4, //4 Hours
            expires : 3600000*4, //4 Hours
            // secure: true		//can access cookie every routers
        },
        store   : new MongoStore({ mongooseConnection: mongoose.connection })
    }
));
//========== define Rest response
var rest_resp_options = {
		showStatusCode: true,
		showDefaultMessage: true
};
app.use(restResponse(rest_resp_options));

//========== Declare routes
app.use('/', routes);
app.use('/test', test);
app.use('/web_parser', web_parser);
app.use('/payment', payment);
app.use('/admin-movie', admin_movie);
app.use('/admin-control', admin_control);
app.use('/admin-dashboard', admin_dashboard);
app.use('/admin-category', admin_category);
app.use('/admin-language', admin_language);
app.use('/admin-app', admin_app);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
	// var err = new Error('Not Found');
	// err.status = 404;
	// next(err);
// });

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 404);
		res.render('error', {
		  message: err.message,
		  error: err
		});
			console.log(err);
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});
// //setup log file to track exceptions
// var logger = new (winston.Logger)({
//     transports: [
//         new (winston.transports.File)({
//             filename: 'llog_data/exceptions_'+config.port+'.html',
//             level: 'error',
//             handleExceptions: true,
//             humanReadableUnhandledException: true,
//             exitOnError: false
//         })
//     ]
// });

module.exports = {app: app, server: server};
