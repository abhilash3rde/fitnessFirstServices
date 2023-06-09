const createError = require('http-errors');
const express = require('express');
var cors = require('cors');
const path = require('path');
var fs = require('fs')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressip = require('express-ip');
var schedule = require('node-schedule');

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
const sessionRouter = require('./routes/Session');
const fileUpload = require('express-fileupload');
const appointmentRouter = require('./routes/Appointment');
const activityRouter = require('./routes/Activity');
const questionRouter = require('./routes/question');
const answerRouter = require('./routes/answer');
const callbackRouter = require('./routes/Callback');
const fitnessRouter = require('./routes/fitness');
const waterIntakeRouter = require('./routes/waterIntake');
const foodItemsRouter = require('./routes/foodItems');
const adminRoutes = require('./routes/admin');
const caloriesIntakeRouter = require('./routes/caloriesIntake');
const recommendRouter = require('./routes/recommend');
const liveStreamRouter = require('./routes/liveStream');
const YoutubeRouter = require('./routes/youtube');
const webhookRouter = require('./routes/webhooks');
const middleware = require('./middleware');
const auth = require('./auth');
const meetings = require('./routes/Meetings')
const scheduler = require('./utility/Scheduler')
const app = express();
app.use(expressip().getIpInfoMiddleware);
app.use(fileUpload({
  limits: {fileSize: 50 * 1024 * 1024},
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir:path.join(__dirname, '/uploads')
}));
// app.use(logg)

app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(logger('combined', { stream: accessLogStream }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
// app.use(upload.array('file'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.get('/logs',(req,res) =>{
  const directoryPath = path.join(__dirname, 'logs');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    res.json(files)
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        console.log(file); 
    });
});
} );
app.get('/logs/:name',(req,res)=>{
 const {name} = req.params
  console.log(name,"calll")
  const directoryPath = path.join(__dirname, 'logs');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
      if(name == file){
  const filepath = path.join(__dirname, 'logs',file);

        fs.readFile(filepath,(err,data)=>{
          if(err) res.json(err)
          res.json(data.toString())
        })
        // res.write(file)
        // res.writeHead(200, {'Content-Type': 'text/html'});
        // res.write(file);
        // return res.end();
        // res.json(file)
        // console.log(file); 

      }
        // Do whatever you want to do with the file
    });
});
})
// app.use('/logs',(req,res) =>{
//   // const {name} = req.
//   console.log(name,"calll")
//   const directoryPath = path.join(__dirname, 'logs');
// //passsing directoryPath and callback function
// fs.readdir(directoryPath, function (err, files) {
//     //handling error
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     } 
//     //listing all files using forEach
//     files.forEach(function (file) {
//       if(name == file){
//         res.write(file)
//         // res.json(files)
//         console.log(file); 

//       }
//         // Do whatever you want to do with the file
//     });
// });
// } );
// app.use('/', indexRouter);
app.get('/testAuthorization', auth.checkJWTValidity);
app.use('/register', registerRouter);
app.post('/login', auth.authenticate, auth.login);
app.use('/trainers', auth.ensureUser, trainerRouter);
app.use('/admin', auth.ensureUser, adminRoutes);
app.use('/trainer', auth.ensureUser, TrainerRouter);
app.use('/user', auth.ensureUser, userRouter);
app.use('/users', auth.ensureUser, usersRouter);
app.use('/post', auth.ensureUser, postRouter);
app.use('/youtube', auth.ensureUser, YoutubeRouter);
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
app.use('/waterIntake', auth.ensureUser, waterIntakeRouter);
app.use('/caloriesIntake', auth.ensureUser, caloriesIntakeRouter);
app.use('/foodItems', auth.ensureUser, foodItemsRouter);
app.use('/recommend', auth.ensureUser, recommendRouter);
app.use('/live', auth.ensureUser, liveStreamRouter);
app.use('/webhooks', webhookRouter);
app.use('/session', auth.ensureUser,sessionRouter);
app.use('/meetings', auth.ensureUser ,meetings)
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(middleware.handleError);
var rule = new schedule.RecurrenceRule();
rule.second = 5
 let j = schedule.scheduleJob(rule, function(){
    //  scheduler.endMeeting()
    console.log("schedular Works")
  });

module.exports = app;