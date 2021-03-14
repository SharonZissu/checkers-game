import React from "react";
import Row from "./Row";
import styled from "styled-components";

const Board = ({
  board,
  pickSoldier,
  optionsToMove,
  moveSoldierHandler,
  pickedSoldier,
}) => {
  return (
    <Container>
      {board.map((row, i) => (
        <Row
          key={i}
          rowIndex={i}
          row={row}
          pickSoldier={pickSoldier}
          optionsToMove={optionsToMove}
          moveSoldierHandler={moveSoldierHandler}
          pickedSoldier={pickedSoldier}
        />
      ))}
    </Container>
  );
};

export default Board;

const Container = styled.div``;
