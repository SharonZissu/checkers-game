import React, { useState, useEffect } from "react";
import socket from "./socketConfig";
import styled from "styled-components";
import Board from "./components/Board";
import { GlobalStyle } from "./styles/globalStyle";

function App() {
  const [board, setBoard] = useState([]);
  const [playerId, setPlayerId] = useState();
  const [optionsToMove, setOptionsToMove] = useState([]);
  const [pickedSoldier, setPickedSoldier] = useState({});
  const [turn, setTurn] = useState(1);
  const [soldiersMustPlay, setSoldiersMustPlay] = useState([]);
  const [winner, setWinner] = useState(0);

  useEffect(() => {
    socket.on("player-id", (playerId) => {
      setPlayerId(playerId);
    });

    socket.on("turn", (turn) => {
      setTurn(turn);
    });

    socket.on("board", (board) => {
      setBoard(board);
    });

    socket.on("must-options", (mustOptions) => {
      setSoldiersMustPlay(mustOptions);
    });

    socket.on("winner", (winner) => {
      setWinner(winner);
    });
  }, []);

  const restartGame = () => {
    socket.emit("restart");
    setOptionsToMove([]);
    setPickedSoldier({});
    setWinner(0);
    setSoldiersMustPlay([]);
  };

  const checkMovement = (row, cell) => {
    const MOVE_DOWN_LEFT =
      row + 1 <= 7 &&
      cell - 1 >= 0 &&
      !board[row + 1][cell - 1].player &&
      turn === 1;
    const MOVE_DOWN_RIGHT =
      row + 1 <= 7 &&
      cell + 1 <= 7 &&
      !board[row + 1][cell + 1].player &&
      turn === 1;
    const MOVE_UP_RIGHT =
      row - 1 >= 0 &&
      cell + 1 <= 7 &&
      !board[row - 1][cell + 1].player &&
      turn === 2;
    const MOVE_UP_LEFT =
      row - 1 >= 0 &&
      cell - 1 >= 0 &&
      !board[row - 1][cell - 1].player &&
      turn === 2;
    let arr = [];
    if (MOVE_DOWN_LEFT) arr.push([row + 1, board[row + 1][cell - 1].id]);
    if (MOVE_DOWN_RIGHT) arr.push([row + 1, board[row + 1][cell + 1].id]);
    if (MOVE_UP_RIGHT) arr.push([row - 1, board[row - 1][cell + 1].id]);
    if (MOVE_UP_LEFT) arr.push([row - 1, board[row - 1][cell - 1].id]);
    if (arr.length !== 0) return arr;
    return [-1, -1];
  };

  const pickSoldier = (row, cell, player) => {
    if (turn !== playerId) return;
    if (!player) return; //if player clicks on empty cell
    if (board[row][cell].player !== turn) return; //if player clicks on opponent soldier
    let canMoveToArr = [];
    let check = false;
    soldiersMustPlay.forEach((item) => {
      //check if there are move that must to be played
      if (item.dest[0] !== -1) {
        check = true;
      }
    });
    if (check) {
      //push to array the moves must play
      soldiersMustPlay.forEach((item) => {
        if (item.source[0] === row && item.source[1] === cell) {
          if (typeof item.dest[0] === "number") {
            //when there are one soldier that have 1 option to jump, item.dest will be array with 2 values, item.dest[0] will be of type number
            canMoveToArr.push([item.dest[0], item.dest[1]]);
          } else {
            //when there are one soldier that have 2 options to jump, item.dest will be of type array
            item.dest.forEach((arr) => {
              if (arr[0] !== -1) {
                canMoveToArr.push([arr[0], arr[1]]);
              }
            });
          }
        }
      });
    }

    if (canMoveToArr.length !== 0) {
      //if there are no must moves
      setOptionsToMove(canMoveToArr);
      setPickedSoldier({ rowIndex: row, cellIndex: cell, player });
      return;
    }
    canMoveToArr = [...checkMovement(row, cell)];
    setOptionsToMove(canMoveToArr);
    setPickedSoldier({ rowIndex: row, cellIndex: cell, player });
  };

  const moveSoldierHandler = (destRowIndex, destCellIndex) => {
    if (Object.keys(pickedSoldier).length !== 0 && optionsToMove.length !== 0) {
      if (board[destRowIndex][destCellIndex].player === pickedSoldier.player) {
        pickSoldier(destRowIndex, destCellIndex, pickedSoldier.player);
        return;
      }
      if (
        optionsToMove.filter(
          (arr) => arr[0] === destRowIndex && arr[1] === destCellIndex
        ).length !== 0
      ) {
        const destintaion = {
          destRowIndex,
          destCellIndex,
        };
        socket.emit("move-soldier", { pickedSoldier, destintaion, playerId });
        setOptionsToMove([]);
        setPickedSoldier({});
        setSoldiersMustPlay([]);
      }
    }
  };
  return (
    <Container>
      {winner !== 0 ? (
        <>
          <Winner>Winner: {winner}</Winner>
          <Button
            onClick={() => {
              restartGame();
            }}
          >
            Restart
          </Button>
        </>
      ) : (
        <>
          <Info>
            {playerId && (
              <PlayerId playerId={playerId}>Player {playerId}</PlayerId>
            )}
            {board.length !== 0 ? (
              <>
                <Turn>Turn: {turn}</Turn>
                <Button
                  onClick={() => {
                    restartGame();
                  }}
                >
                  Restart
                </Button>
              </>
            ) : (
              <h1>Waiting for opponent...</h1>
            )}
          </Info>
        </>
      )}
      <Board
        board={board}
        pickSoldier={pickSoldier}
        optionsToMove={optionsToMove}
        moveSoldierHandler={moveSoldierHandler}
        pickedSoldier={pickedSoldier}
      />
      <GlobalStyle />
    </Container>
  );
}

export default App;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
`;

const Info = styled.div`
  display: flex;
  margin-bottom: 2rem;
  justify-content: space-between;

  align-items: center;
  width: 50%;
`;

const PlayerId = styled.label`
  font-size: 3rem;
  color: ${({ playerId }) => (playerId === 1 ? "red" : "black")};
`;

const Turn = styled.label`
  font-size: 3rem;
`;
const Button = styled.button`
  padding: 1rem;
  width: 15rem;
  margin-left: 3rem;
  font-size: 2rem;
  text-transform: uppercase;
  box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;

const Winner = styled.h1`
  font-size: 3rem;
  text-transform: uppercase;
`;
