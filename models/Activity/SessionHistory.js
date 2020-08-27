// const mongoose = require('mongoose');
// const cuid = require('cuid');
//
// const db = require('../../config/db');
// const {sessionTypes} = require('../../constants');
//
// const sessionHistorySchema = mongoose.Schema({
//   _id: {
//     type: String,
//     ref: 'Session',
//     required:true
//   },
//
// });
//
// const Model = db.model('SessionHistory', sessionHistorySchema);
//
// async function get(_id) {
//   const model = await Model.findOne(
//     {_id},
//     {__v: 0}
//   );
//   return model;
// }
//
// async function remove(_id) {
//   const model = await get(_id);
//   if (!model) {
//     return;
//   }
//   await Model.deleteOne({_id});
// }
//
// async function create(fields) {
//   const model = new Model(fields);
//   await model.save();
//   return model;
// }
//
// module.exports = {
//   get,
//   create,
//   remove,
//   model: Model
// }