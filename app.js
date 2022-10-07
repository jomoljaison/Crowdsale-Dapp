var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var session = require('express-session');

var flash = require('connect-flash');

var Web3 = require("web3");

const app = express()
var multer = require('multer');

const fs = require('fs');

var mysql = require('mysql');
const ejs = require('ejs');


var whitelistRouter = require('./routes/whitelist');

var userRouter = require('./routes/user');
var setWhitelistRoot = require('./routes/setWhitelistRoot');
var setPreSaleStart = require('./routes/setPreSaleStart');
var withdrawMoney = require('./routes/withdrawMoney');
var mint = require('./routes/mint');
var publicSaleMintWithEth = require('./routes/publicSaleMintWithEth');
var unsolded = require('./routes/unsolded');
var preSaleStart = require('./routes/preSaleStart');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'webslesson',
  cookie: { maxAge: 60000 },
  saveUninitialized: false,
  resave: false
}));
app.use(flash());



//-------------------WEB3 Integration starts-----------------------

var MyContractJSON = require(path.join(__dirname, 'build/contracts/OneOneFive.json'));
var Web3 = require("web3");
const web3 = new Web3('http://localhost:7545');
accountAddress = ""; //Ganache

const contractAddress = MyContractJSON.networks['5777'].address;
console.log("contract address", contractAddress)

const contractAbi = MyContractJSON.abi;

MyContract = new web3.eth.Contract(contractAbi, contractAddress);
// console.log("MYContrcat",MyContract);



app.use('/', whitelistRouter);
app.use('/whitelist', whitelistRouter);
app.use('/setWhitelistRoot', setWhitelistRoot);
app.use('/setPreSaleStart', setPreSaleStart);
app.use('/withdrawMoney', withdrawMoney);
app.use('/mint', mint);
app.use('/publicSaleMintWithEth', publicSaleMintWithEth);
app.use('/unsolded', unsolded);
app.use('/preSaleStart', preSaleStart);

app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
