const {admin} = require('./config');

const {agoraAppId} = require('./constants');

const sendNotification = async (fcmToken) => {
  await admin.messaging().sendToDevice(
    [fcmToken],
    {
      data: {
        "priority": "high",
        "sessionId": 'random',
        "agoraAppId": agoraAppId,
        "type": "call",
        // "userEmail":'TestUser',
        "displayName":"Yatanvesh",
        "dpUrl":'https://www.telegraph.co.uk/content/dam/men/2016/04/22/PD68583783_dtho201_2655530b_trans_NvBQzQNjv4BqpJliwavx4coWFCaEkEsb3kvxIt-lGGWCWqwLa_RXJU8.jpg?imwidth=450'
      }
    },
    {
      contentAvailable: true,
      priority: 'high',
    },
  );
  process.exit();
}
if(process.argv[2])
sendNotification(process.argv[2])
