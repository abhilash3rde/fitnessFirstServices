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
const paymentRouter = require('./routes/payment');
const fileUpload = require('express-fileupload');
// const {onConnection} = require('./routes/socket');
const appointmentRouter = require('./routes/Appointment');
const activityRouter = require('./routes/Activity');
const questionRouter = require('./routes/question');
const answerRouter = require('./routes/answer');
const fitnessRouter = require('./routes/fitness');
const callbackRouter = require('./routes/Callback');
const liveStreamRouter = require('./routes/liveStream');
const middleware = require('./middleware');
const auth = require('./auth');

const app = express();
app.use(expressip().getIpInfoMiddleware);

app.use(fileUpload({
  limits: {fileSize: 50 * 1024 * 1024},
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: './uploads'
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
app.use('/call', auth.ensureUser, callRouter);
app.use('/package', auth.ensureUser, packageRouter);
app.use('/slot', auth.ensureUser, slotRouter);
app.use('/subscription', auth.ensureUser, subscriptionRouter);
app.use('/appointment', auth.ensureUser, appointmentRouter);
app.use('/payment', auth.ensureUser, paymentRouter);
app.use('/activity', auth.ensureUser, activityRouter);
app.use('/question', auth.ensureUser, questionRouter);
app.use('/answer', auth.ensureUser, answerRouter);
app.use('/fitness', auth.ensureUser, fitnessRouter);
app.use('/callback', auth.ensureUser, callbackRouter);
app.use('/live', auth.ensureUser, liveStreamRouter);

// io.on('connection', onConnection);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(middleware.handleError);

// schedule.scheduleJob(CRON_NOTIFY_HOWS_SESSION, function(){
//   scheduler.notifyHowsSession();
// });

module.exports = app;