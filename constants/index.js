const userTypes = {
  TRAINER: 'TRAINER',
  USER: 'USER'
}
const CHANNELS = {
  STORE_CLIENT_INFO: 'STORE_CLIENT_INFO',
  CHECK_USER_ONLINE: 'CHECK_USER_ONLINE',
  INITIATE_VIDEO_CALL: 'INITIATE_VIDEO_CALL',
  CONFIRM_VIDEO_CALL: 'CONFIRM_VIDEO_CALL'
}

const CONTENT_TYPE = {
  TEXT: 'TEXT',
  VIDEO: 'VIDEO',
  IMAGE: 'IMAGE'
}

const POST_TYPE = {
  TYPE_POST: 'TYPE_POST',
  TYPE_WORKOUT: 'TYPE_WORKOUT'
}

//TODO - this is random allocation if no wall image
const RANDOM_WALL_IMAGE = {
  1: "https://res.cloudinary.com/matrim/image/upload/v1593788759/oottv1b6pa143q6kcdxl.jpg",
  2: "https://res.cloudinary.com/matrim/image/upload/v1593788858/ijfwfuaptywq5edpef4z.jpg",
  3: "https://res.cloudinary.com/matrim/image/upload/v1593788925/nyuvgdocpkitvcyomsqu.jpg",
  4: "https://res.cloudinary.com/matrim/image/upload/v1593788959/bnvgnbionkejhg0t2byl.jpg",
  5: "https://res.cloudinary.com/matrim/image/upload/v1593789294/j5uakjxg63fw8d0sydpe.jpg",
  6: "https://res.cloudinary.com/matrim/image/upload/v1593789610/mxuwhxjri8vyryqpa8tg.jpg",
  7: "https://res.cloudinary.com/matrim/image/upload/v1593789757/gwl6wt7kpaqkellpb9qy.jpg",
  8: "https://res.cloudinary.com/matrim/image/upload/v1593789792/dgeyojqy8vbpb9q2xzou.jpg",
  9: "https://res.cloudinary.com/matrim/image/upload/v1593789835/ascfghgln568cqahimt0.jpg",
  10: "https://res.cloudinary.com/matrim/image/upload/v1593789867/wsdxpauypw0o1pbnzath.jpg",
  11: "https://res.cloudinary.com/matrim/image/upload/v1593789909/jmfptmvdyem8r4injnlj.jpg",
  12: "https://res.cloudinary.com/matrim/image/upload/v1593789940/gwxwcm1xjwc8e5a7lkmb.jpg"
}

const ENABLE_FILE_UPLOAD = process.env.ENABLE_FILE_UPLOAD || true;

const CRON_NOTIFY_HOWS_SESSION = " 0/30 * * * * * ";

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const WEEK_DAYS_FULL_NAMES = {
  SUN: "Sunday",
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday"
};

const TIME_STRING = ['0000', '0100', '0200', '0300', '0400',
  '0500', '0600', '0700', '0800', '0900',
  '1000', '1100', '1200', '1300', '1400',
  '1500', '1600', '1700', '1800', '1900',
  '2000', '2100', '2200', '2300']

const agoraApps = {
  primary: 'de359ae21a884e08a18e38476b54ccea',
  secondary: 'da0c4d0c5bcb47799554eb975cb8f86a'
}
const agoraAppIds = [agoraApps.primary, agoraApps.secondary]
//test key
const paymentKey = {
  key_id: 'rzp_test_BuIiL164HHvbBm',
  key_secret: 'K04EHPRWO0XXd1JwapCcHR32'
}

const firebaseTopics = {
  SILENT_NOTIFICATION: 'SILENT_NOTIFICATION',
  DISPLAY_NOTIFICATION:'DISPLAY_NOTIFICATION'
}
const remoteMessageTypes = {
  CALL: 'call',
  APPOINTMENT: "appointmentNotification",
  SESSION: 'sessionNotification',
  UPDATE_POSTS: 'UPDATE_POSTS',
  CALLBACK_REQ: 'CALLBACK_REQ',
  CALLBACK_ACCEPT: 'CALLBACK_ACCEPT',
  GENERIC_NOTIFICATION:'GENERIC_NOTIFICATION'
}
const claimStatus = {
  NONE: 'NONE',
  REQUESTED: 'REQUESTED',
  DONE: 'DONE'
}
const packageTypes = {
  FAT_LOSS: 'Fat Loss',
  WEIGHT_LOSS: 'Weight Loss',
  WEIGHT_GAIN: 'Weight Gain',
  MUSCLE_GAIN: 'Muscle Gain',
  BODY_MASS_GAIN: 'Body Mass Gain',
  LEAN_BODY_MASS: 'Lean Body Mass',
  POWER_LIFTING: 'Power Lifting',
  STRENGTH_GAIN: 'Strength Gain'
}
const callbackStatus = {
  REQUESTED: 'REQUESTED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
}
const streamStatus = {
  SCHEDULED:'SCHEDULED',
  LIVE:'LIVE',
  FINISHED:'FINISHED'
}

module.exports = {
  userTypes,
  CHANNELS,
  CONTENT_TYPE,
  ENABLE_FILE_UPLOAD,
  RANDOM_WALL_IMAGE,
  CRON_NOTIFY_HOWS_SESSION,
  WEEK_DAYS,
  TIME_STRING,
  WEEK_DAYS_FULL_NAMES,
  paymentKey,
  POST_TYPE,
  firebaseTopics,
  remoteMessageTypes,
  agoraAppIds,
  claimStatus,
  packageTypes,
  callbackStatus,
  streamStatus
}


