const cuid = require("cuid");
const mongoose = require("mongoose");
const db = require("../config/db");

const foodItemsSchema = mongoose.Schema({
  _id: {
    type: String,
    default: cuid,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 100,
  },
  totalEnergy: {
    type: Number,
    required: true,
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
  pretotal: {
    type: Number,
    required: true,
  },
  prefats: {
    type: Number,
    required: true,
  },
  precarbs: {
    type: Number,
    required: true,
  },
  preproteins: {
    type: Number,
    required: true,
  },
  type : {
    type : Boolean,
    required : true
  }
});

const Model = db.model("foodItems", foodItemsSchema);

async function getByName(name, qty) {
  const model = await Model.findOne({
    name: { $regex: ".*" + name + ".*", $options: "xsi" },
    type : qty
  });

  return model;
}

async function create(fields) {
  const model = new Model({
    ...fields,
    pretotal: fields.totalEnergy,
    prefats: fields.fats,
    precarbs: fields.carbs,
    preproteins: fields.proteins,
  });

  await model.save();
  return model;
}

async function getByIds(arrayOfIds) {
  const model = await Model.find({ _id: { $in: arrayOfIds } }).select("-__v");
  return model;
}
module.exports = {
  getByName,
  create,
  getByIds,
  model: Model,
};
