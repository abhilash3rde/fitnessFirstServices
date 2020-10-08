const cuid = require("cuid");
const mongoose = require("mongoose");
const db = require("../config/db");
const {foodTypes} = require('../constants');
const foodItems = require("./foodItems");
const mealSchema = mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
  },
  measure: {
    type: String,
  },
  _id: {
    type: String,
    default: cuid,
  },
  id: {
    type: String,
  },
  type: {
    type: String,
  },
  item: {
    type: String,
  },
  quantity: {
    type: Number,
  },

  total: {
    type: Number,
  },
  fats: {
    type: Number,
  },
  carbs: {
    type: Number,
  },
  proteins: {
    type: Number,
  },
  date: {
    type: String,
    default: Date.now,
  },
});

async function get(userId) {
  //get get recommendation
  let completeFoodArray = await Model.aggregate(
    [

      {$match: {userId: userId}},
      {
        "$group": {
          "_id": {
            "type": "$type",
            "id": "$id"
          },
          "itemCount": {"$sum": 1},
        }
      },
      {"$sort": {"count": -1}},

      {
        "$group": {
          "_id": "$_id.type",
          "items": {
            "$push": {
              "id": "$_id.id",
              "count": "$itemCount"
            },
          },
          "count": {"$sum": "$itemCount"},

        },

      },
      {"$sort": {"_id.items.id": -1}}
      // { "$limit": 3 }
    ]
  );
  // await Promise.all(result, completeFoodArray);
  //to store ids of type of  food i.e. breakfast ...
  let breafastIds = [], lunchIds = [], dinnerIds = [], snacksIds = [];
  if (completeFoodArray.length > 0) {
    //first filter according to type and then take 0th elements which contains foodIds and their count , then remove foodId by mapping
    if (completeFoodArray.filter(doc => doc._id === foodTypes.BREAKFAST)[0]) {
      breafastIds = await completeFoodArray.filter(doc => doc._id === foodTypes.BREAKFAST)[0].items.map(food => food.id)
    }
    if (completeFoodArray.filter(doc => doc._id === foodTypes.SNACKS)[0]) {
      snacksIds = await completeFoodArray.filter(doc => doc._id === foodTypes.SNACKS)[0].items.map(food => food.id)

    }
    if (completeFoodArray.filter(doc => doc._id === foodTypes.LUNCH)[0]) {
      lunchIds = await completeFoodArray.filter(doc => doc._id === foodTypes.LUNCH)[0].items.map(food => food.id)

    }
    if (completeFoodArray.filter(doc => doc._id === foodTypes.DINNER)[0]) {
      dinnerIds = await completeFoodArray.filter(doc => doc._id === foodTypes.DINNER)[0].items.map(food => food.id)

    }
    const breakfastList = await foodItems.getByIds(breafastIds);//make api call to get data of foodItems
    const lunchList = await foodItems.getByIds(lunchIds);
    const snacksList = await foodItems.getByIds(snacksIds);
    const dinnerList = await foodItems.getByIds(dinnerIds);
    // await Promise.all(breakfastList, lunchList, snacksList, dinnerList);
    const finalRecommend = {
      BREAKFAST: breakfastList,
      LUNCH: lunchList,
      SNACKS: snacksList,
      DINNER: dinnerList
    };
    return finalRecommend;
  } else {
    return false;
  }

}

create = async (foodItem) => {
  const model = new Model(foodItem);
  await model.save();
  return model;
};
const Model = db.model("Meal", mealSchema);
module.exports = {
  get,
  create,
  model: Model,
};
//this is how a particular data looks
// {
//     id: 'ckeazk9n80001wku75jtmhmg2',
//     type: 'DINNER',
//     item: 'bread',
//     quantity: 200,
//     total: 534,
//     pretotal: 267,
//     prefats: 29,
//     fats: 58,
//     precarbs: 195,
//     carbs: 390,
//     preproteins: 43,
//     proteins: 86
//   }
