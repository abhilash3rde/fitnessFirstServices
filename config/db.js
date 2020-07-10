const mongoose = require('mongoose');

const dbName = process.env.dbName || 'demo';
mongoose.connect(
  process.env.MONGO_URI || `mongodb+srv://boi:244466666@cluster0-nssjy.mongodb.net/${dbName}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology:true }
)

module.exports = mongoose