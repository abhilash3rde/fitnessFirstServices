const {admin} = require('./config');

const {agoraAppId} = require('./constants');

const sendNotification = async (fcmToken, data) => {
  await admin.messaging().sendToDevice(
    [fcmToken],
    {
      data: {
        "priority": "high",
        ...data
      }
    },
    {
      contentAvailable: true,
      priority: 'high',
    },
  );
  process.exit();
}
switch (process.argv[2]) {
  case 'call':
    sendNotification(process.argv[3], {
      agoraAppId: agoraAppId,
      type: 'call',
      sessionId: 'random',
      displayName: 'Yatan',
      "dpUrl": 'https://www.telegraph.co.uk/content/dam/men/2016/04/22/PD68583783_dtho201_2655530b_trans_NvBQzQNjv4BqpJliwavx4coWFCaEkEsb3kvxIt-lGGWCWqwLa_RXJU8.jpg?imwidth=450'
    });
    break;
  case 'appointment':
    sendNotification(process.argv[3], {
      type: 'appointmentNotification',
      content: 'Random message'
    });
    break;
}
