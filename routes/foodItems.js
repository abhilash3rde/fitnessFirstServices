const express = require("express");
const router = express.Router();
const foodItems = require("../models/foodItems");
const {getFoodData} = require("../utility/utility");

router.post("/getByName/", async (req, res, next) => {
  try {
    const {name , qty} = req.body;
    console.log(qty)
    const foodItem = await foodItems.getByName(name, qty);
    console.log(foodItem)
    if (foodItem) {
      //if foodItem exists in our database then send that foodItem
      return res.json({foodItem, success: true});
    } else {
      //if fooditem doesnt exist then call api to get details
      const resData = await getFoodData(name, qty);
      if (resData.totalNutrientsKCal) {
        let data = {}
        if(qty){
          data = {
            quantity: 1,
            name: name,
            type : qty,
            totalEnergy: resData.totalNutrientsKCal.ENERC_KCAL.quantity,
            fats: resData.totalNutrientsKCal.FAT_KCAL.quantity,
            carbs: resData.totalNutrientsKCal.CHOCDF_KCAL.quantity,
            proteins: resData.totalNutrientsKCal.PROCNT_KCAL.quantity,
          };
        }else{
          data = {
            quantity: 100,
            name: name,
            type : qty,
            totalEnergy: resData.totalNutrientsKCal.ENERC_KCAL.quantity,
            fats: resData.totalNutrientsKCal.FAT_KCAL.quantity,
            carbs: resData.totalNutrientsKCal.CHOCDF_KCAL.quantity,
            proteins: resData.totalNutrientsKCal.PROCNT_KCAL.quantity,
          };
        }
        const foodItem = await foodItems.create(data); //save this new foodItem in our database
        return res.json({foodItem, success: true});
      } else {
        console.log("No food item with particular name");
        return res.status(500).json({error: "No food item found"});
      }
    }
  } catch (error) {
    console.log("error in catch foodItems ");
    res.status(500).json({error: "Catch error "});
    console.log(error);
  }
});

module.exports = router;
