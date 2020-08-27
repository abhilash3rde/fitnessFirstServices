const cuid = require("cuid");
const mongoose = require("mongoose");
const db = require("../config/db");

const foodItemsSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid,
  },
  carbs: {
    type: Number,
    required: true,
  },
  proteins: {
    type: Number,
    required: true,
  },
  fats: {
    type: Number,
    required: true,
  },
  totalEnergy: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 100,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Model = db.model("foodItems", foodItemsSchema);

async function getByName(name) {
  console.log("get mei aaya");
  const model = await Model.findOne({ name });
  return model;
}

async function create(fields) {
  console.log("create mei aaya");
  const model = new Model({...fields});
  await model.save();
  return model;
}

module.exports = {
  getByName,
  create,
  model: Model,
};
