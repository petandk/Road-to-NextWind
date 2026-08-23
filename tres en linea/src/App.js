import { useState } from "react";

function Square({ value, onSquareClick, isWinning }) {
  return (
    <button
      className={"square" + (isWinning ? " winning" : "")}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }
  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const winningLine = winnerInfo ? winnerInfo.line : [];
  const isDraw = !winner && squares.every(Boolean);
  let status;
  if (winner) {
    status = "Ganador: " + winner;
  } else if (isDraw) {
    status = "Empate!";
  } else {
    status = "Siguiente jugador: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square
          value={squares[0]}
          onSquareClick={() => handleClick(0)}
          isWinning={winningLine.includes(0)}
        />
        <Square
          value={squares[1]}
          onSquareClick={() => handleClick(1)}
          isWinning={winningLine.includes(1)}
        />
        <Square
          value={squares[2]}
          onSquareClick={() => handleClick(2)}
          isWinning={winningLine.includes(2)}
        />
      </div>
      <div className="board-row">
        <Square
          value={squares[3]}
          onSquareClick={() => handleClick(3)}
          isWinning={winningLine.includes(3)}
        />
        <Square
          value={squares[4]}
          onSquareClick={() => handleClick(4)}
          isWinning={winningLine.includes(4)}
        />
        <Square
          value={squares[5]}
          onSquareClick={() => handleClick(5)}
          isWinning={winningLine.includes(5)}
        />
      </div>
      <div className="board-row">
        <Square
          value={squares[6]}
          onSquareClick={() => handleClick(6)}
          isWinning={winningLine.includes(6)}
        />
        <Square
          value={squares[7]}
          onSquareClick={() => handleClick(7)}
          isWinning={winningLine.includes(7)}
        />
        <Square
          value={squares[8]}
          onSquareClick={() => handleClick(8)}
          isWinning={winningLine.includes(8)}
        />
      </div>
    </>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }
  const moves = history.map((squares, move) => {
    let description =
      move > 0 ? "Ir al movimiento #" + move : "Ir al inicio del juego";
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });
  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}
