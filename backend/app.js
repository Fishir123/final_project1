var createError = require('http-errors');
var express = require('express');
var dotenv = require('dotenv');
dotenv.config();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var registerRouter = require('./routes/auth/register');
var loginRouter = require('./routes/auth/login');
var wargaLaporanRouter = require('./routes/warga/laporan');
var wargaUsulanRouter = require('./routes/warga/usulan');
var wargaIuranRouter = require('./routes/warga/iuran');
var adminLaporanRouter = require('./routes/admin/laporan');
var adminUsulanRouter = require('./routes/admin/usulan');
var adminIuranRouter = require('./routes/admin/iuran');
var adminPemasukanRouter = require('./routes/admin/pemasukan');
var adminPengeluaranRouter = require('./routes/admin/pengeluaran');
var midtransNotificationRouter = require('./routes/midtrans/notification');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/register', registerRouter);
app.use('/api/login', loginRouter);
app.use('/api/warga/laporan', wargaLaporanRouter);
app.use('/api/warga/usulan', wargaUsulanRouter);
app.use('/api/warga/iuran', wargaIuranRouter);
app.use('/api/admin/laporan', adminLaporanRouter);
app.use('/api/admin/usulan', adminUsulanRouter);
app.use('/api/admin/iuran', adminIuranRouter);
app.use('/api/admin/pemasukan', adminPemasukanRouter);
app.use('/api/admin/pengeluaran', adminPengeluaranRouter);
app.use('/api/midtrans/notification', midtransNotificationRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
  });
});

module.exports = app;
