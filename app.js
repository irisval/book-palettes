require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const indexRouter = require('./routes/index');

const app = express();


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views/layouts/'));

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultView: 'index',
  helpers: require('./public/js/helpers.js'),
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(indexRouter);

app.get('*', function(req, res){
  res.render('404');
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
