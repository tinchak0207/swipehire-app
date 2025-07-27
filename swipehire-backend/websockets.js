
const { Server } = require("socket.io");

function setupWebsockets(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("new-comment", (comment) => {
      console.log("new-comment", comment);
      io.emit("new-comment", comment);
    });

    socket.on("new-reply", (reply) => {
      console.log("new-reply", reply);
      io.emit("new-reply", reply);
    });

    socket.on("suggestion-vote", (vote) => {
      console.log("suggestion-vote", vote);
      io.emit("suggestion-vote", vote);
    });
  });

  return io;
}

module.exports = setupWebsockets;
