const express = require("express");
const router = express.Router();

const caloriesIntake = require("../models/caloriesIntake");
router.post("/save", async function (req, res, next) {
  try {
    const { userId } = req;

    let result = await caloriesIntake.createOrUpdate(
      userId,
      req.body.date,
      req.body.foodItems
    );

    console.log(result);
    res.json({ success: true });
  } catch (err) {
    console.log("routes file mei error hai");

    res.status(500).json({
      err: err.message,
    });
  }
});
module.exports = router;
// {
//     "24/8/2020":[
//        {
//           "carbs":12,
//           "fats":352,
//           "id":"cke8lws7a0000toreek77xmua",
//           "item":"egg",
//           "proteins":208,
//           "quantity":400,
//           "total":572,
//           "type":"BREAKFAST"
//        },
//        {
//           "carbs":585,
//           "fats":87,
//           "id":"cke8lx1bn0001torer1iraxtx",
//           "item":"bread",
//           "precarbs":195,
//           "prefats":29,
//           "preproteins":43,
//           "pretotal":267,
//           "proteins":129,
//           "quantity":300,
//           "total":801,
//           "type":"LUNCH"
//        }
//     ]
//  }


// async functoin (userId, date, foodItems) => {
//   conole.log("11");
//   let meals = [];
//   conole.log("1");
//   console.log(foodItems);
//   console.log("3");
//   await foodItems.map(async (food) => {
//     const meal =await Meal.create({ ...food, userId, date });
//     meals.push(meal._id);
//   });
// console.log("after appending meals");
//   const model = await Model.findOne({ userId, date });
//   if (model) {
//     console.log("if mei");
//     model.mealsIntake = model.mealsIntake.concat(meals);
//     await model.save();
//     console.log(model);
//     return model;
//   } else {
//     console.log("else mei");
//     const model = new Model({
//       date,
//       mealsIntake: meals,
//       userId,
//     });
//     console.log("2nd else");
//     await model.save();
//     return model;
//   }
// };