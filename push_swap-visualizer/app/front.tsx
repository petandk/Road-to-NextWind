"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface Props {
  defaultNumbers: string;
  defaultMoves: string;
  numbers100: string;
  moves100: string;
}

export default function Front({
  defaultNumbers,
  defaultMoves,
  numbers100,
  moves100,
}: Props) {
  const [is100, setIs100] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyIndex, setVerifyIndex] = useState(0);
  const [verifyStatus, setVerifyStatus] = useState<
    "checking" | "error" | "success"
  >("checking");
  const activeNumbers = !is100 ? defaultNumbers : numbers100;
  const activeMoves = !is100 ? defaultMoves : moves100;
  const { numbersArray, movesArray } = useMemo(() => {
    const nums = activeNumbers.trim().split(/\s+/).map(Number);
    const movs = activeMoves.trim().split(/\s+/).filter(Boolean);

    return { numbersArray: nums, movesArray: movs };
  }, [activeNumbers, activeMoves]);

  const history = useMemo(() => {
    const stackA = [...numbersArray];
    const stackB: number[] = [];

    const frames = [{ a: [...stackA], b: [...stackB], move: "Inicio" }];
    for (const move of movesArray) {
      switch (move) {
        case "sa":
          if (stackA.length >= 2)
            [stackA[0], stackA[1]] = [stackA[1], stackA[0]];
          break;
        case "sb":
          if (stackB.length >= 2)
            [stackB[0], stackB[1]] = [stackB[1], stackB[0]];
          break;
        case "ss":
          if (stackA.length >= 2)
            [stackA[0], stackA[1]] = [stackA[1], stackA[0]];
          if (stackB.length >= 2)
            [stackB[0], stackB[1]] = [stackB[1], stackB[0]];
          break;
        case "pa":
          if (stackB.length > 0) stackA.unshift(stackB.shift()!);
          break;
        case "pb":
          if (stackA.length > 0) stackB.unshift(stackA.shift()!);
          break;

        case "ra":
          if (stackA.length > 0) stackA.push(stackA.shift()!);
          break;
        case "rb":
          if (stackB.length > 0) stackB.push(stackB.shift()!);
          break;
        case "rr":
          if (stackA.length > 0) stackA.push(stackA.shift()!);
          if (stackB.length > 0) stackB.push(stackB.shift()!);
          break;
        case "rra":
          if (stackA.length > 0) stackA.unshift(stackA.pop()!);
          break;
        case "rrb":
          if (stackB.length > 0) stackB.unshift(stackB.pop()!);
          break;
        case "rrr":
          if (stackA.length > 0) stackA.unshift(stackA.pop()!);
          if (stackB.length > 0) stackB.unshift(stackB.pop()!);
          break;
      }
      frames.push({ a: [...stackA], b: [...stackB], move: move });
    }
    return frames;
  }, [numbersArray, movesArray]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((lastStep) => {
        if (lastStep >= history.length - 1) {
          setIsPlaying(false);
          return lastStep;
        }
        return lastStep + 1;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, history.length]);

  const currentFrame = history[currentStep];

  useEffect(() => {
    if (!isVerifying || verifyStatus !== "checking") return;

    const interval = setInterval(() => {
      setVerifyIndex((prev) => {
        const a = currentFrame.a;

        if (prev >= a.length - 1) {
          setVerifyStatus("success");
          return prev;
        }
        if (a[prev] > a[prev + 1]) {
          setVerifyStatus("error");
          return prev + 1;
        }
        return prev + 1;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isVerifying, verifyStatus, currentFrame.a]);

  const renderTrain = (stack: number[], stackType: "A" | "B") => {
    const maxVisible = 20;
    const isTooLong = stack.length > maxVisible;
    const visibleStack = isTooLong
      ? [
          ...stack.slice(0, maxVisible / 2),
          "...",
          ...stack.slice((maxVisible / 2) * -1),
        ]
      : stack;
    const boxSize = numbersArray.length > 50 ? 35 : 65;
    const bgColor = stackType === "A" ? "#3b82f6" : "ef4444";
    return (
      <div className="w-full bg-black p-4 rounded min-h-30 flex flex-row items-center justify-center gap-2 overflow-x-auto border-b-4 border-gray-500">
        {visibleStack.map((item, index) => {
          if (item === "...") {
            return (
              <div
                key={`dots-${index}`}
                className="text-gray-400 text-2xl font-bold px-2"
              >
                ...
              </div>
            );
          }
          return (
            <div
              key={`${index}-${item}`}
              title={`Valor: ${item}`}
              className="shrink-0 flex items-center justify-center font-bold rounded border-2 border-white/20 transition-all duration-200 text-white"
              style={{
                width: `${boxSize}px`,
                height: `${boxSize}px`,
                backgroundColor: bgColor,
                fontSize: numbersArray.length > 50 ? "0.75rem" : "1.2rem",
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 relative w-full max-w-6xl mx-auto pt-4">
      {isVerifying && (
        <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden">
          <h2 className="text-4xl text-white font-bold mb-16 font-mono h-12">
            {verifyStatus === "checking" && (
              <span className="animate-pulse">Escaneando Stack A...</span>
            )}
            {verifyStatus === "success" && (
              <span className="text-green-500">
                ¡Perfectamente Ordenado! 🟢
              </span>
            )}
            {verifyStatus === "error" && (
              <span className="text-red-500">¡ERROR DE ORDENACIÓN! 🔴</span>
            )}
          </h2>

          <div className="relative w-full h-32 flex items-center">
            <div
              className="absolute left-1/2 -ml-8 flex items-center gap-4 transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(${-verifyIndex * 80}px)` }}
            >
              {currentFrame.a.map((num, i) => {
                const isCurrent = i === verifyIndex;
                const isPast = i < verifyIndex;
                const isErrorBox = verifyStatus === "error" && isCurrent;

                let bgColor = "bg-gray-800 text-gray-500";
                if (isPast || (isCurrent && verifyStatus !== "error"))
                  bgColor = "bg-green-500 text-white";
                if (isErrorBox) bgColor = "bg-red-600 text-white";

                return (
                  <div
                    key={`scan-${i}`}
                    className={`w-16 h-16 shrink-0 flex items-center justify-center text-xl font-bold rounded transition-all duration-300 ${bgColor} 
                        ${isCurrent ? "scale-150 shadow-[0_0_20px_rgba(0,255,0,0.4)] z-10" : "scale-100 opacity-40"} 
                        ${isErrorBox ? "shadow-[0_0_30px_rgba(255,0,0,0.8)]! scale-150!" : ""}`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>

            <div className="absolute left-1/2 top-1/2 w-24 h-24 border-4 border-white/30 rounded-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"></div>
          </div>

          <button
            onClick={() => setIsVerifying(false)}
            className="mt-20 px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Cerrar Escáner
          </button>
        </div>
      )}
      <div className="flex justify-between w-full">
        <button
          onClick={() => {
            setIs100(!is100);
            setCurrentStep(0);
            setIsPlaying(false);
          }}
          className="px-6 py-2 bg-blue-600 rounded text-white font-bold hover:bg-blue-500 transition-colors"
        >
          Test de {is100 ? "10" : "100"} valores
        </button>
        <Sheet>
          <SheetTrigger className="px-4 py-2 bg-gray-700 rounded text-white font-bold hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Menu size={20} /> Info
          </SheetTrigger>

          <SheetContent
            side="right"
            className="bg-gray-900 text-white border-l-gray-700 w-100 overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle className="text-green-400 font-mono text-xl">
                Manual del Visualizador
              </SheetTitle>
              <SheetDescription className="text-gray-400">
                Guía de uso y funcionamiento del algoritmo.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-8 flex flex-col gap-8 text-sm text-gray-200">
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">
                  Modificar los datos
                </h3>
                <p className="mb-2">
                  1. Abre{" "}
                  <code className="bg-black text-white p-1 rounded font-mono">
                    /testing_files/
                  </code>
                  .
                </p>
                <p className="mb-2">
                  2. Edita{" "}
                  <code className="bg-black text-white p-1 rounded font-mono">
                    numbers.txt
                  </code>{" "}
                  o{" "}
                  <code className="bg-black text-white p-1 rounded font-mono">
                    moves.txt
                  </code>
                  .
                </p>
                <p>3. Guarda y recarga la página (F5).</p>
              </div>

              <div>
                <h3 className="font-bold text-yellow-400 mb-2">
                  Leyenda de movimientos
                </h3>
                <ul className="list-disc pl-4 space-y-2 font-mono text-xs">
                  <li>
                    <span className="text-blue-400">sa / sb / ss:</span>{" "}
                    Intercambia los 2 primeros.
                  </li>
                  <li>
                    <span className="text-green-400">pa / pb:</span> Pasa el 1º
                    al otro stack.
                  </li>
                  <li>
                    <span className="text-purple-400">ra / rb / rr:</span> Rota
                    arriba (el 1º va al final).
                  </li>
                  <li>
                    <span className="text-red-400">rra / rrb / rrr:</span> Rota
                    abajo (el último va al 1º).
                  </li>
                </ul>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="bg-black text-green-400 p-4 rounded w-full max-w-2xl font-mono border border-white">
        <Accordion className="max-w-lg mx-auto">
          <AccordionItem value="numbers">
            <AccordionTrigger>Números desordenados</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">{activeNumbers}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="moves">
            <AccordionTrigger>Movimientos calculados</AccordionTrigger>
            <AccordionContent>
              <p>{activeMoves}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="w-full bg-black border border-white p-4 rounded-lg flex flex-col gap-4">
        <div className="flex justify-between items-center text-sm font-mono text-green-400">
          <span>
            Paso: {currentStep} / {history.length - 1}
          </span>
          <span className="text-xl font-bold text-white bg-gray-800 px-4 py-1 rounded">
            Último mov: {currentFrame.move.toUpperCase()}
          </span>
          {currentStep === history.length - 1 && (
            <button
              onClick={() => {
                setVerifyIndex(0);
                setVerifyStatus("checking");
                setIsVerifying(true);
              }}
              className="px-4 py-1 bg-purple-600 text-white font-bold rounded shadow-[0_0_15px_rgba(168, 85, 247, 0.5)] hover:bg-purple-500 transition-all animate-pulse"
            >
              🔍 Verificar Orden
            </button>
          )}
          <span className="flex items-center gap-2 text-white">
            Velocidad:
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={1010 - speed}
              onChange={(e) => setSpeed(1010 - Number(e.target.value))}
              className="cursor-pointer accent-blue-500"
            />
          </span>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCurrentStep(0)}
            className="p-2 bg-gray-700 rounded hover:bg-gray-500"
          >
            ⏮️
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep((p) => Math.max(0, p - 1));
            }}
            className="p-2 bg-gray-700 rounded hover:bg-gray-500"
          >
            ⏪
          </button>
          <button
            onClick={() => {
              if (currentStep >= history.length - 1) {
                setCurrentStep(0);
                setIsPlaying(true);
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
            className={`px-8 py-2 rounded font-bold ${isPlaying ? "bg-yellow-600 text-black hover:bg-yellow-950" : "bg-green-600 text-white hover:bg-green-950"}`}
          >
            {isPlaying ? "⏸️" : "▶️"}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep((p) => Math.min(history.length - 1, p + 1));
            }}
            className="p-2 bg-gray-700 rounded hover:bg-gray-500"
          >
            ⏩
          </button>
          <button
            onClick={() => setCurrentStep(history.length - 1)}
            className="p-2 bg-gray-700 rounded hover:bg-gray-500"
          >
            ⏭️
          </button>
        </div>
        <input
          type="range"
          min="0"
          max={history.length - 1}
          value={currentStep}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentStep(Number(e.target.value));
          }}
          className="w-full cursor-pointer accent-blue-500"
        />
      </div>
      <div className="flex flex-col w-full gap-8 bg-gray-900 p-8 border border-gray-700 rounded-lg">
        <div className="w-full flex flex-col">
          <h2 className="text-xl font-bold mb-2 text-blue-400">STACK A</h2>
          {renderTrain(currentFrame.a, "A")}
        </div>
        <div className="w-full flex flex-col">
          <h2 className="text-xl font-bold mb-2 text-red-400">STACK B</h2>
          {renderTrain(currentFrame.b, "B")}
        </div>
      </div>
    </div>
  );
}
