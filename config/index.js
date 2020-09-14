const admin = require("firebase-admin");

const firebaseDatabaseUrl = 'https://gymapp-2f1c9.firebaseio.com';
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseDatabaseUrl
});

const zoomConfig = { // server config
  key:'5Y66g6wkSb-LLf9wfFgO0w',
  secret:'I8kQI5seL0hlzGh44mfuklC6Wmsk05IXB1HP',
  userId:'roopesh@thirdessential.com',
  baseUrl:'https://api.zoom.us/v2'
}

const zoomClientConfig = {
  key: 'X27PRPQWTnGY4fHMazSBpZx8foNuHJczqXkG',
  secret: 'r0Wop1qcebA8pee3fEVku2yN0R7zJxEPA2OY',
  userId: 'roopesh@thirdessential.com',
  domain: 'zoom.us'
}

module.exports ={
  firebaseDatabaseUrl,
  admin,
  zoomConfig,
  zoomClientConfig
}