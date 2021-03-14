import React from "react";
import Cell from "./Cell";
import styled from "styled-components";

const Row = ({
  rowIndex,
  row,
  pickSoldier,
  optionsToMove,
  moveSoldierHandler,
  pickedSoldier,
}) => {
  return (
    <Container>
      {row.map(({ id, player, isPlayable }) => (
        <Cell
          key={id}
          cellIndex={id}
          rowIndex={rowIndex}
          isPlayable={isPlayable}
          player={player}
          pickSoldier={pickSoldier}
          optionsToMove={optionsToMove}
          moveSoldierHandler={moveSoldierHandler}
          pickedSoldier={pickedSoldier}
        />
      ))}
    </Container>
  );
};

export default Row;

const Container = styled.div`
  width: 80rem;
  height: 7.5rem;
  display: flex;
`;
