const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const foodItems = require("../models/foodItems");
router.post("/getByName/", async (req, res, next) => {
  try {
    const { name } = req.body;
    const foodItem = await foodItems.getByName(name);

    if (foodItem) {
      //if foodItem exists in our database then send that fooditem

      return res.json({ foodItem, success: true });
      //return foodItem;
    } else {
      //if fooditem doesnt exist then call api to get details
      const url =
        "https://api.edamam.com/api/nutrition-details?app_id=3794d72a&app_key=97878e1f8b135ae65328bd7fbbcc0453";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "demo api",
          ingr: [`100 gram of ${name}`],
        }),
      });
      const resData = await response.json();

      if (resData.totalNutrientsKCal) {
        const data = {
          quantity: 100,
          name: name,
          totalEnergy: resData.totalNutrientsKCal.ENERC_KCAL.quantity,
          fats: resData.totalNutrientsKCal.FAT_KCAL.quantity,
          carbs: resData.totalNutrientsKCal.CHOCDF_KCAL.quantity,
          proteins: resData.totalNutrientsKCal.PROCNT_KCAL.quantity,
        };
        console.log(data);

        const foodItem = await foodItems.create(data); //save this new foodiItem in our database

        return res.json({ foodItem, success: true });
      } else {
        console.log("No food item with particular name");
        return res.status(500).json({ error: "No food item found" });
      }
    }
  } catch (error) {
    console.log("error in catch foodItems ");
    res.status(500).json({ error: "Catch error " });
    console.log(error);
  }
});

module.exports = router;
