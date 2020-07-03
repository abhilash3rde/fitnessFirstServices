const userTypes = {
  TRAINER: 'TRAINER',
  USER:'USER'
}
const CHANNELS = {
  STORE_CLIENT_INFO:'STORE_CLIENT_INFO',
  CHECK_USER_ONLINE:'CHECK_USER_ONLINE',
  INITIATE_VIDEO_CALL:'INITIATE_VIDEO_CALL',
  CONFIRM_VIDEO_CALL:'CONFIRM_VIDEO_CALL'
}

const CONTENT_TYPE = {
  VIDEO:'VIDEO',
  IMAGE:'IMAGE'
}

//TODO - this is random allocation if no wall image
const RAMDOM_WALL_IMAGE = {
  1:"https://res.cloudinary.com/matrim/image/upload/v1593788759/oottv1b6pa143q6kcdxl.jpg",
  2:"https://res.cloudinary.com/matrim/image/upload/v1593788858/ijfwfuaptywq5edpef4z.jpg",
  3:"https://res.cloudinary.com/matrim/image/upload/v1593788925/nyuvgdocpkitvcyomsqu.jpg",
  4:"https://res.cloudinary.com/matrim/image/upload/v1593788959/bnvgnbionkejhg0t2byl.jpg",
  5:"https://res.cloudinary.com/matrim/image/upload/v1593789294/j5uakjxg63fw8d0sydpe.jpg",
  6:"https://res.cloudinary.com/matrim/image/upload/v1593789610/mxuwhxjri8vyryqpa8tg.jpg",
  7:"https://res.cloudinary.com/matrim/image/upload/v1593789757/gwl6wt7kpaqkellpb9qy.jpg",
  8:"https://res.cloudinary.com/matrim/image/upload/v1593789792/dgeyojqy8vbpb9q2xzou.jpg",
  9:"https://res.cloudinary.com/matrim/image/upload/v1593789835/ascfghgln568cqahimt0.jpg",
  10:"https://res.cloudinary.com/matrim/image/upload/v1593789867/wsdxpauypw0o1pbnzath.jpg",
  11:"https://res.cloudinary.com/matrim/image/upload/v1593789909/jmfptmvdyem8r4injnlj.jpg",
  12:"https://res.cloudinary.com/matrim/image/upload/v1593789940/gwxwcm1xjwc8e5a7lkmb.jpg"
}

const ENABLE_FILE_UPLOAD = process.env.ENABLE_FILE_UPLOAD || true;

const agoraAppId = 'de359ae21a884e08a18e38476b54ccea';
module.exports = {
  userTypes,
  CHANNELS,
  agoraAppId,
  CONTENT_TYPE,
  ENABLE_FILE_UPLOAD,
  RAMDOM_WALL_IMAGE
}
