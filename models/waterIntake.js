const cuid = require("cuid");
const mongoose = require("mongoose");
const db = require("../config/db");
const mongoosePaginate = require("mongoose-paginate");
//{"25/8/2020": 4250, "26/8/2020": 1000}
const waterIntakeSchema = mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
  },
  quantity: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
  },
});

const Model = db.model("waterIntake", waterIntakeSchema);

async function createOrUpdate(userId, date, quantity) {
  const model = await Model.findOne({ userId, date });
  if (model) {
    model.quantity = quantity;
    await model.save();
  } else {
    const model = new Model({
      date,
      quantity,
      userId,
    });
    await model.save();

    return model;
  }
  return model;
}

module.exports = {
  createOrUpdate,
  model: Model,
};
