const jwt = require('jsonwebtoken');
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const Users = require('./models/user');
const bcrypt = require('bcrypt');
const {userTypes} = require("./constants");
const user = require('./models/user');

const jwtSecret = process.env.JWT_SECRET || 'mark it zero'
const adminPassword = process.env.ADMIN_PASSWORD || 'iamthewalrus';
const jwtOpts = {
  algorithm: 'HS256',
  // expiresIn: '30d'
}
const adminJwtOpts = {
  algorithm: 'HS256',
  expiresIn: '6d'
}

passport.use(adminStrategy());

const login = async (req, res) => {
  const {userEmail, userType, userId} = req.user;
  const user=await user.get(userEmail)
  // console.log(user)
  // if (!user){
  //   res.status(500).json({
  //     err:'user Not Found'
  //   });
  // }else{
    const authToken = await sign({
      userEmail,
      userType,
      userId
    },
    userType === userTypes.ADMIN ? adminJwtOpts : jwtOpts);
  res.json({
    success: true,
    authToken,
    userType,
    email: userEmail,
    userId
  });
  // }
  
}

const authenticate = passport.authenticate('local', {
  session: false
});

async function ensureUser(req, res, next) {

  try {
    const jwtString = req.headers.authorization;
    const payload = await verify(jwtString);

    if (payload) {
      req.userEmail = payload.userEmail;
      req.userType = payload.userType;
      req.userId = payload.userId;
      return next();
    }

    const err = new Error('Unauthorized')
    err.statusCode = 401
    next(err)
  } catch (err) {
    err.statusCode = 401
    next(err)
  }
}

async function checkJWTValidity(req, res, next) {
  try {
    const jwtString = req.headers.authorization;
    const payload = await verify(jwtString);
    if (payload) {
      res.json({valid: true});
    } else
      throw new Error('invalid jwt');
  } catch (err) {
    res.status(401).json({valid: false});
  }
}

function adminStrategy() {
  return new Strategy(async function (email, password, cb) {
    try {
      let user = await Users.get(email);
      if (!user) return cb(null, false);
      const isUser = await bcrypt.compare(password, user.password);
      console.log(isUser)
      if (isUser) {
        return cb(null, {
          userEmail: user.email,
          userType: user.userType,
          userId: user._id
        })
      }
    } catch (err) {
      console.log('error in authentication')
    }
    cb(null, false)
  })
}

async function sign(payload, opts = jwtOpts) {
  console.log('signing token', opts);
  return await jwt.sign(payload, jwtSecret, opts);
}

async function verify(jwtString = '') {
  jwtString = jwtString.replace(/^Bearer /i, '')
  try {
    const payload = await jwt.verify(jwtString, jwtSecret);
    return payload;
  } catch (err) {
    err.statusCode = 401;
    throw err
  }
}

module.exports = {
  authenticate,
  login,
  ensureUser,
  checkJWTValidity,
  sign,
  verify
}