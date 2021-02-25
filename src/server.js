'use strict';
require('dotenv').config();
const socketIO = require('socket.io');

const httpServer = require('http').createServer();
httpServer.listen(process.env.SOCKETPORT);

console.log('SERVER sockets listening on: ', process.env.PORT);

const io = socketIO(httpServer, {
  cors: {
    // origin: "http://localhost:3002", //for testing local
    origin: "https://parent-pickup-coordinator.netlify.app/", //for deployment
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

io.set('transports', ['websocket']); //from https://stackoverflow.com/questions/25268160/node-js-socket-io-on-heroku-throws-h13

io.on('connection', (socket) => {

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log('A user joined chatroom: ' + room);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected: ' + socket.id);
  });

  socket.on('pickupready', (payload) => {
    console.log('pickupReady: ' + payload.name);
    socket.to(payload.teacher).emit('pickupready', payload);
  });

  socket.on('sendingstudent', (payload) => {
    console.log('SERVER: sending student out: ' + payload.name);
    console.log('SERVER: we made it past the stacy log');
    const clients = io.sockets.adapter.rooms.get(payload.teacher);
    console.log('SERVER: this is the clients: ', clients);
    socket.to(payload.teacher).emit('sendingstudent', (payload));
  })

  socket.on('leaveRoom', ({ Student }) => {
    socket.leave(Student.teacher);
    console.log('A user left chatroom: ' + Student.teacher);
  });
})



