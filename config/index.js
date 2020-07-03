const admin = require("firebase-admin");

const firebaseDatabaseUrl = 'https://gymapp-2f1c9.firebaseio.com';
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseDatabaseUrl
});

module.exports ={
  firebaseDatabaseUrl,
  admin
}