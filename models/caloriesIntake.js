const cuid = require("cuid");
const mongoose = require("mongoose");
const db = require("../config/db");
const Meal = require("./meal");
const caloriesIntakeSchema = mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
  },
  mealsIntake: [
    {
      type: String,
      ref: "Meal",
    },
  ],

  date: {
    type: String,
  },
});

const Model = db.model("caloriesIntake", caloriesIntakeSchema);

createOrUpdate = async (userId, date, foodItems) => {
  let meals = [];
  let res=foodItems.map(async (food) => {
    const meal = await Meal.create({ ...food, userId, date });
    
    
    meals.push(meal._id);
    
    console.log(meals);
  });
  await Promise.all(res);
  const model = await Model.findOne({ userId, date });
  if (model) {
    
    console.log(model.mealsIntake);
   
    console.log(meals);
    model.mealsIntake = meals.concat(model.mealsIntake);
    await model.save();
    console.log(model);
    return model;
  } else {
   
    const model = new Model({
      date,
      mealsIntake: meals ,
      userId,
    });
    await model.save();
    return model;
  }
};

module.exports = {
  createOrUpdate,
  model: Model,
};
