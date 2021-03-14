const players = [];
let turn = 1;
let board = initialBoard();
let player1Soldiers = 12;
let player2Soldiers = 12;

function initialBoard() {
  let arr = [];
  for (let i = 0; i < 8; i++) {
    let row = [];
    for (let j = 0; j < 8; j++) {
      let isPlayable =
        (j % 2 === 0 && i % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0);
      let player = null;
      if (isPlayable) {
        if (i <= 2) {
          player = 1;
        } else if (i >= 5) {
          player = 2;
        }
      }
      row.push({
        id: j,
        player,
        isPlayable,
      });
    }
    arr.push(row);
  }
  return arr;
}

exports.joinGame = (io, socket, playerId) => {
  const players = getPlayers();
  if (players.length < 2) {
    players.push(playerId);
    if (players.length === 2) {
      socket.emit("player-id", 2);
      io.emit("board", board);
    } else {
      socket.emit("player-id", 1);
    }
  } else {
    console.log("Full!");
  }
};

function getPlayers() {
  return players;
}

function checkJumping(row, cell, player) {
  const EAT_DOWN_LEFT =
    row + 2 <= 8 &&
    cell - 2 >= 0 &&
    board[row + 1][cell - 1].player !== player &&
    board[row + 1][cell - 1].player !== null &&
    !board[row + 2][cell - 2].player &&
    turn === 1;

  const EAT_DOWN_RIGHT =
    row + 2 <= 8 &&
    cell + 2 <= 7 &&
    board[row + 1][cell + 1].player !== player &&
    board[row + 1][cell + 1].player !== null &&
    !board[row + 2][cell + 2].player &&
    turn === 1;

  const EAT_UP_RIGHT =
    row - 2 >= 0 &&
    cell + 2 <= 7 &&
    board[row - 1][cell + 1].player !== player &&
    board[row - 1][cell + 1].player !== null &&
    !board[row - 2][cell + 2].player &&
    turn === 2;

  const EAT_UP_LEFT =
    row - 2 >= 0 &&
    cell - 2 >= 0 &&
    board[row - 1][cell - 1].player !== player &&
    board[row - 1][cell - 1].player !== null &&
    !board[row - 2][cell - 2].player &&
    turn === 2;

  let arr = [];
  if (EAT_DOWN_RIGHT) arr.push([row + 2, board[row + 2][cell + 2].id]);
  if (EAT_DOWN_LEFT) arr.push([row + 2, board[row + 2][cell - 2].id]);
  if (EAT_UP_RIGHT) arr.push([row - 2, board[row - 2][cell + 2].id]);
  if (EAT_UP_LEFT) arr.push([row - 2, board[row - 2][cell - 2].id]);
  if (arr.length !== 0) return arr;
  return [-1, -1];
}

exports.eatSoldier = (io, pickedSoldier, destintaion, playerId) => {
  const { destRowIndex, destCellIndex } = destintaion;
  const {
    rowIndex: sourceRowIndex,
    cellIndex: sourceCellIndex,
  } = pickedSoldier;
  const DOWN_RIGHT =
    destRowIndex === sourceRowIndex + 2 &&
    destCellIndex === sourceCellIndex + 2;
  const DOWN_LEFT =
    destRowIndex === sourceRowIndex + 2 &&
    destCellIndex === sourceCellIndex - 2;
  const UP_RIGHT =
    destRowIndex === sourceRowIndex - 2 &&
    destCellIndex === sourceCellIndex + 2;
  const UP_LEFT =
    destRowIndex === sourceRowIndex - 2 &&
    destCellIndex === sourceCellIndex - 2;
  let isJump = false;
  if (DOWN_RIGHT) {
    board[sourceRowIndex + 1][sourceCellIndex + 1].player = null;
    isJump = true;
  }
  if (DOWN_LEFT) {
    board[sourceRowIndex + 1][sourceCellIndex - 1].player = null;
    isJump = true;
  }
  if (UP_RIGHT) {
    board[sourceRowIndex - 1][sourceCellIndex + 1].player = null;
    isJump = true;
  }
  if (UP_LEFT) {
    board[sourceRowIndex - 1][sourceCellIndex - 1].player = null;
    isJump = true;
  }
  if (isJump) {
    if (playerId === 1) player2Soldiers--;
    else player1Soldiers--;
    let winner = 0;
    if (player1Soldiers === 0) {
      winner = 2;
    } else if (player2Soldiers === 0) {
      winner = 1;
    }
    if (winner) {
      io.emit("winner", winner);
    }
  }
  board[destRowIndex][destCellIndex].player = pickedSoldier.player;
  board[pickedSoldier.rowIndex][pickedSoldier.cellIndex].player = null;
  io.emit("board", board);
  io.emit("turn", playerId === 1 ? 2 : 1);
  turn = playerId === 1 ? 2 : 1;
  let mustOptions = [];
  board.forEach((row, rowIndex) =>
    row.forEach((cell, cellIndex) => {
      const { isPlayable, player } = cell;
      if (isPlayable && player === turn) {
        mustOptions.push({
          source: [rowIndex, cellIndex],
          dest: checkJumping(rowIndex, cellIndex, player),
        });
      }
    })
  );

  io.emit("must-options", mustOptions);
};

exports.restartGame = (io) => {
  board = initialBoard();
  io.emit("board", board);
  io.emit("turn", 1);
};
