const cuid = require('cuid');

const {CHANNELS} = require('../constants');
const ConnectionModel = require('../models/connection');
const {verify} = require('../auth');

const onConnection = (socket, io) => {
  socket.on(CHANNELS.STORE_CLIENT_INFO, async (data) => {
    const {authToken} = data;
    if (!authToken) {
      console.log("No auth token provided!");
      return;
    }
    const {userId} = await verify(authToken);

    let connection = await ConnectionModel.create({
      userId,
      socketId: socket.id
    })
    console.log(`New connection ${socket.id} established`)
  });

  socket.on(CHANNELS.CHECK_USER_ONLINE, async (data) => {
    const {userId} = data;
    console.log("check req for ", userId);
    const connection = await ConnectionModel.get(userId);
    const {creationTime} = connection;
    let time = Date.now();
    let connectionCreationTime = new Date(creationTime);
    console.log(time - connectionCreationTime);
    if(time-connectionCreationTime<30000){
      socket.emit(CHANNELS.CHECK_USER_ONLINE, true);
    } else {
      socket.emit(CHANNELS.CHECK_USER_ONLINE, false);
    }
  })

  socket.on(CHANNELS.INITIATE_VIDEO_CALL, async (data) => {
    const {userId} = data;
    console.log("Video call req for ", userId);
    const sessionID =  cuid();
    const connection = await ConnectionModel.get(userId);
    if (connection) {
      socket.emit(CHANNELS.INITIATE_VIDEO_CALL, {sessionID});
      setTimeout(() => io.to(connection.socketId).emit(CHANNELS.CONFIRM_VIDEO_CALL, {sessionID}), 3000
      );
    } else {

    }
  })

  socket.on('disconnect', function (data) {
    ConnectionModel.remove(socket.id);
    console.log(`socket ${socket.id} terminated`)
  });
}

module.exports = {
  onConnection
}