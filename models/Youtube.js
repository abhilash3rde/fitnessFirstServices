const { isEmail } = require('validator');
const cuid = require('cuid');

const db = require('../config/db');
const { hashPassword } = require("../utility/utility");


const Model = db.model('YoutubeVideos', {
    _id: {
        type: String,
        default: cuid
    },
    video_id: {
        type: String,
        required: true
    },
    trainer_name: {
        type: String,
        required: true
    },
    created_on: {
        type: Date,
        default: Date.now()
    },
    video_type:{
        type:String,
        default:'youtube'
    },
    updated_on: {
        type: Date,
        default: null
    }

})

async function get(email) {
    const model = await Model.findOne(
        { email },
        { __v: 0 }
    );
    return model;
}
async function getAllvideos() {
    const model = await Model.find(
        {}
    );
    return model;
}

async function getById(_id) {
    const model = await Model.findOne(
        { _id },
        { __v: 0 }
    );
    return model;
}

async function remove(email) {
    await Model.deleteOne({
        email
    })
}

async function create(fields) {
    // const existingModel = await getById(fields._id);
    // if (existingModel) return existingModel;
console.log(fields);
    const model = new Model(fields);
    console.log(model)
    await model.save()
    return model;
}

async function setUserType(id, type) {
    const user = await getById(id);
    user.userType = type;
    await user.save();
    return true;
}


async function isUnique(doc, property) {
    const existing = await get(property);
    return !existing || doc._id === existing._id;
}

module.exports = {
    get,
    getById,
    create,
    getAllvideos,
    remove,
    setUserType,
    model: Model
}