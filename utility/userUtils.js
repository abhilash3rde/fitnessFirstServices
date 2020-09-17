const { userTypes } = require('../constants');
const TrainerData = require('../models/trainerData');
const UserData = require('../models/userData');

async function populateUser(userId, userType) {
    let name, displayPictureUrl, wallImageUrl;
    if (userType === userTypes.TRAINER) {
        const trainerData = await TrainerData.getTrainer(userId);
        name = trainerData.name;
        displayPictureUrl = trainerData.displayPictureUrl;
        wallImageUrl = trainerData.wallImageUrl;
    }
    else {
        const userData = await UserData.getUser(userId);
        name = userData.name;
        displayPictureUrl = userData.displayPictureUrl;
        wallImageUrl = userData.wallImageUrl;
    }
    const data = { userId, userType, name, displayPictureUrl, wallImageUrl }
    return data;

}

module.exports = {
    populateUser
}