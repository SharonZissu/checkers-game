import React from "react";
import styled from "styled-components";

const Cell = ({
  cellIndex,
  rowIndex,
  player,
  isPlayable,
  pickSoldier,
  pickedSoldier,
  optionsToMove,
  moveSoldierHandler,
}) => {
  const checkCellsDest = () =>
    optionsToMove.length !== 0 &&
    optionsToMove.filter((arr) => arr[0] === rowIndex && arr[1] === cellIndex)
      .length !== 0;

  return (
    <Container
      isPlayable={isPlayable}
      player={player}
      hoverCell={checkCellsDest()}
      onClick={
        Object.keys(pickedSoldier).length === 0
          ? () => pickSoldier(rowIndex, cellIndex, player)
          : () => moveSoldierHandler(rowIndex, cellIndex)
      }
    ></Container>
  );
};

export default Cell;

const Container = styled.div`
  width: 12.5%;
  height: 100%;
  background-color: ${({ isPlayable }) => (isPlayable ? "#6d6e6e" : "#eee")};
  position: relative;
  &::before {
    display: ${({ player }) => (!player ? "none" : "block")};
    position: absolute;
    top: 50%;
    left: 50%;
    content: "";
    width: 75%;
    height: 90%;
    transform: translate(-50%, -50%);
    background-color: ${({ player }) => (player === 1 ? "red" : "black")};
    border-radius: 50%;
  }

  &::after {
    display: ${({ hoverCell }) => (hoverCell ? "block" : "none")};
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    top: 50;
    background-color: green;
  }
`;
