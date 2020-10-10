const mongoose = require('mongoose');
 const mode = ['dev','prod','testing']
 const modee = process.env.mode || mode[1]
 console.log(modee,'1')
let dbName
let dbString
console.log(Date(),"Date()");
console.log(new Date(),"new Date()");

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
 