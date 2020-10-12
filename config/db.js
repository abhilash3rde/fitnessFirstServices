const mongoose = require('mongoose');
 const mode = ['dev','prod','testing']
 const modee = process.env.mode || mode[1]
 console.log(modee,'1')
let dbName
let dbString
let date= new Date().toString();
let date1= Date.now()
let now = new Date();
let time = new Date().getTimezoneOffset();
let newmin = time % 60;
let newhrs = time / 60;
now.setHours(now.getHours() - newhrs);
now.setMinutes(now.getMinutes() - newmin);
// let myDate = new Date();

// let futureStartAtDate = moment.isDate(myDate);

// var date = moment(myDate).utcOffset(330, true);

// console.log(date, "==>")
// let dateObject = date.toDate();
// console.log(typeof dateObject, "type");

// console.log(dateObject.getHours());

// console.log(date1 - time,"time")

console.log(new Date(date1 - time))
 switch (mode[0]){
   case 'dev':
     console.log('dev')
     dbName = 'Cluster0';
 dbString=`mongodb+srv://GymAddaDev:GymAddaDev@cluster0.xptfc.mongodb.net/${dbName}>?retryWrites=true&w=majority` //dev cluster
 mongoose.connect(
  process.env.MONGO_URI || dbString,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology:true }
)
break;
case "testing":
  console.log('testing')
  dbName =  'delta';
 dbString=`mongodb+srv://boi:244466666@cluster0-nssjy.mongodb.net/${dbName}?retryWrites=true&w=majority` //Yatan Cluster
mongoose.connect(
  process.env.MONGO_URI || dbString,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology:true }
)
break;
case 'prod':
     console.log('production')
     dbName ='GymAdda';
 dbString=`mongodb+srv://qqqqqqqq9:qqqqqqqq9@gymadda.auw7i.mongodb.net/${dbName}?retryWrites=true&w=majority` //devesh Cluster
 mongoose.connect(
  process.env.MONGO_URI || dbString,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology:true }
)
break;
 }
 
 module.exports = mongoose;
 