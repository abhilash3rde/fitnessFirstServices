const cuid = require("cuid");
const mongoose = require("mongoose");
const db = require("../config/db");

const mealSchema = mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
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
  pretotal: {
    type: Number,
  },
  prefats: {
    type: Number,
  },
  fats: {
    type: Number,
  },
  precarbs: {
    type: Number,
  },
  carbs: {
    type: Number,
  },
  preproteins: {
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
  // console.log("get mei aaya of meals");
  // //const model=await Model.find({userId});
  // let result = await Model.aggregate(
  //   [

  //     { $match: { userId: userId } },
  //     { "$group": {
  //       "_id": {
  //         "type": "$type",
  //         "item": "$item"
  //       },
  //       "itemCount":{"$sum":1},
  //   }},
  //   { "$group": {
  //       "_id": "$_id.type",
  //       "items": { 
  //           "$push": { 
  //             "item":"$_id.item",
  //             "count":"$itemCount"
  //           },
  //       },
  //       "count": { "$sum": "$itemCount" },
         
  //   },
  //   // "$sort": { "count": -1 } 
  // },
    
  //   // { "$limit": 3 }


      
  //     // {
  //     //   $group: {
  //     //     _id: {
  //     //       "type": "$type",
  //     //       "item": "$item"
  //     //   },
  //     //     "itemCount":{"$sum":1},
  //     //   },

  //     // },
  //     // {
  //     //   $group: {
  //     //     _id:"$_id.type",
  //     //     "items":{"$push":{
  //     //         "item":"$_id.item",
  //     //         "count":"$itemCount"
  //     //     }},
          
  //     //   },
  //     //   // {
  //     //   //   "$sort":{
  //     //   //       "count":-1
  //     //   //   }
  //     //   // }

  //     // },
     
      

  //   ],  
  //   (err, docs) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       // console.log("12345");
  //       // console.log(docs[0].items);
  //       // console.log(docs[1].items);
  //       // console.log(docs[2].items);
  //     }
  //   }
  // );
  return true;
}

create = async (foodItem) => {
  const model = new Model(foodItem);
  await model.save();
  console.log("meals1 ws");
  console.log(model);
  console.log("meals2");
  return model;
};
const Model = db.model("Meal", mealSchema);
module.exports = {
  get,
  create,
  model: Model,
};
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


// [
//     { $match: { userId: userId } },
//     {
//       $group: {
//         _id: "$type",
        
//       },
//     },
//     {
//         $group:{
//             _id:"$item",
//             count: {
//                 $sum: 1
//               }
//         }
//     }
//   ],

// {
    // $project: {
    //     "items": "$items",
    //     "": 1,
    //     "_id": 0,
    //     "size": {
    //         $size: "$machineId"
    //     }
    //     }
    // }