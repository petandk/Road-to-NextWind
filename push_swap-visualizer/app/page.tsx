import { readFile } from "fs/promises";
import Front from "./front";

async function getData(numbersPath: string, movesPath: string) {
  const numbersText = await readFile(process.cwd() + numbersPath, "utf-8");
  const movesText = await readFile(process.cwd() + movesPath, "utf-8");
  return { numbersText, movesText };
}

export default async function home() {
  const { numbersText: numbers, movesText: moves } = await getData(
    "/testing_files/numbers.txt",
    "/testing_files/moves.txt",
  );
  const { numbersText: numbers100, movesText: moves100 } = await getData(
    "/testing_files/numbers100.txt",
    "/testing_files/moves100.txt",
  );
  return (
    <main className="p-8 bg-gray-900 min-h-screen text-white">
      <Front
        defaultNumbers={numbers}
        defaultMoves={moves}
        numbers100={numbers100}
        moves100={moves100}
      />
    </main>
  );
}
