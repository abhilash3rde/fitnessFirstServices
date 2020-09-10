const prompt = require('prompt');
const {isEmail} = require('validator');
const cuid = require('cuid');

const {admin} = require('./config');
const {agoraAppId, firebaseTopics, remoteMessageTypes} = require('./constants');
const User = require('./models/user');
const {userTypes} = require("./constants");

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
  case 'topic':
    const message = {
      data: {
        type: remoteMessageTypes.UPDATE_POSTS
      },
      topic: firebaseTopics.SILENT_NOTIFICATION,
    };

    admin
      .messaging()
      .send(message)
      .then(response => {
        console.log('Successfully sent message:', response);
      })
      .catch(error => {
        console.log('Error sending message:', error);
      });
    break;
  case 'admin': {
    const properties = [
      {
        name: 'email',
        description: 'Enter Email',
        validator: isEmail,
        required: true
      },
      {
        name: 'name',
        description: 'Enter Name',
        required: true
      },
      {
        name: 'password',
        hidden: true,
        description: 'Enter password',
        replace: '*',
        required: true
      },
      {
        name: 'password_re',
        hidden: true,
        description: 'Re enter password',
        replace: '*',
        required: true
      },
    ];
    prompt.start();

    prompt.get(properties, async function (err, result) {
      if (err) {
        console.log("Error", err);
        return
      }
      const {email, name, password, password_re} = result;
      if (password !== password_re) {
        console.log("Passwords dont match");
        return;
      }
      console.log("Creating admin account for ", email, name);
      await User.create({
        _id: cuid(),
        email,
        password,
        userType: userTypes.ADMIN
      });
      console.log("Success");
      process.exit();
    });
  }
    break;
}
