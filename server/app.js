const express = require("express");
const app = express();
const socketio = require("socket.io");
const cors = require("cors");
const PORT = 5000;
const expressServer = app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});

const io = socketio(expressServer);

const { joinGame, eatSoldier, restartGame } = require("./gameManager");

app.use(cors());
io.origins("*:*");
io.on("connection", (socket) => {
  console.log("socket" + socket.id + " is enter the web");
  joinGame(io, socket, socket.id);
  socket.on("move-soldier", ({ pickedSoldier, destintaion, playerId }) => {
    eatSoldier(io, pickedSoldier, destintaion, playerId);
  });
  socket.on("restart", () => {
    restartGame(io);
  });
});
