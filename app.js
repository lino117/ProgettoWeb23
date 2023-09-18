var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var socialRouter = require('./routes/social');

var app = express();

const mongoose =require( "mongoose");
mongoose.connect("mongodb+srv://jinclaudio:Keqingyyds123.@claudiomongo.3ulb5gw.mongodb.net/?retryWrites=true&w=majority");
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB 连接错误："));
db.once('open', ()=> console.log("Db connesso"));
console.log("sono qui ")
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/social', socialRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
