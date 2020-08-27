const admin = require("firebase-admin");

const firebaseDatabaseUrl = 'https://gymapp-2f1c9.firebaseio.com';
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseDatabaseUrl
});

const zoomConfig = {
  key:'DDJdP2oAQzSK5URM4cenfA',
  secret:'mOBCgjFV4M5fRi6cXGqrgjN5Tj6Hik5VQlBv',
  userId:'oggybuddy10@gmail.com',
  baseUrl:'https://api.zoom.us/v2'
}

const zoomClientConfig = {
  key: 'hKodHeKdo7c0g7Qh4Dx5MnQMp6j19tc1WGbs',
  secret: 'Pxu4Jq7BjGG50kXxoDizV1FkAcLxdwTmDtPq',
  userId: 'oggybuddy10@gmail.com',
  domain: 'zoom.us'
}

module.exports ={
  firebaseDatabaseUrl,
  admin,
  zoomConfig,
  zoomClientConfig
}