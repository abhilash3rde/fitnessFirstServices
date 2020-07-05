const createError = require('http-errors');
const express = require('express');
var cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressip = require('express-ip');

const indexRouter = require('./routes/index');
const registerRouter = require('./routes/register');
const trainerRouter = require('./routes/trainers');
const TrainerRouter = require('./routes/Trainer');
const userRouter = require('./routes/user');
const usersRouter = require('./routes/Users');
const postRouter = require('./routes/posts');
const commentRouter = require('./routes/comment');
const callRouter = require('./routes/call');
const packageRouter = require('./routes/Package');
const slotRouter = require('./routes/Slot');
const subscriptionRouter = require('./routes/Subscription');
var fileupload = require('express-fileupload');
// const {onConnection} = require('./routes/socket');
const appointmentRouter = require('./routes/Appointment');

const middleware = require('./middleware');
const auth = require('./auth');

const app = express();
app.use(expressip().getIpInfoMiddleware);

app.use(fileupload({
  limits: { fileSize: 50 * 1024 * 1024 },
  abortOnLimit:true,
  useTempFiles: true,
  tempFileDir : './uploads'
}));

app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
// app.use(upload.array('file'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.get('/testAuthorization', auth.checkJWTValidity);
app.use('/register', registerRouter);
app.post('/login', auth.authenticate, auth.login);
app.use('/trainers', auth.ensureUser, trainerRouter);
app.use('/trainer', auth.ensureUser, TrainerRouter);
app.use('/user', auth.ensureUser, userRouter);
app.use('/users', auth.ensureUser, usersRouter);
app.use('/post', auth.ensureUser, postRouter);
app.use('/comment', auth.ensureUser, commentRouter);
app.use('/call', auth.ensureUser,callRouter);
app.use('/package', auth.ensureUser, packageRouter);
app.use('/slot', auth.ensureUser, slotRouter);
app.use('/subscription', auth.ensureUser, subscriptionRouter);
app.use('/appointment', auth.ensureUser, appointmentRouter);

// io.on('connection', onConnection);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(middleware.handleError);

// schedule.scheduleJob(CRON_NOTIFY_HOWS_SESSION, function(){
//   scheduler.notifyHowsSession();
// });

// admin.messaging().sendToDevice(
//   ['dZe1F-nmTbqxzJ9w6DyfTM:APA91bE1Zh_f8f4PMBkPryzLK6HzkONOk29vog5nfHWC4W-6cULvxoQ8hlSmD2sMTx4zzDCP8VZPwpBK_5BEDXsgVx2eS6ttACF_4kPwUAqL5TkECEeKdafe_bcwNkoObsJkUi65pe58'],
//   {
//     data: {
//       "priority": "high",
//       "uuid": "uuid of user",
//       "name": "RNVoip",
//       "type": "call"
//     }
//   },
//   {
//     contentAvailable: true,
//     priority: 'high'
//   },
// );
module.exports = app;