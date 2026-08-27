"use client";
import { useState, useEffect } from "react";
import {
  createInitialState,
  generateAnimationSteps,
  RPNState,
} from "@/lib/rpnEngine";

export default function RPNCalculator() {
  const [expression, setExpression] = useState<string>("");
  const [animationSteps, setAnimationSteps] = useState<RPNState[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const STEP_MS = 1200;
  const MERGE_MS = 700;

  // Round for display (e.g. 3.3333333333333335 → 3.33) and keep "Infinity"
  const formatResult = (value: number): string => {
    if (!isFinite(value)) return String(value);
    return String(Math.round(value * 100) / 100);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimating && animationSteps.length > 0) {
      if (currentStepIndex < animationSteps.length - 1) {
        const isMerge =
          animationSteps[currentStepIndex + 1].stack.length ===
          animationSteps[currentStepIndex].stack.length - 1;
        timer = setTimeout(
          () => {
            setCurrentStepIndex((prev) => prev + 1);
          },
          isMerge ? MERGE_MS : STEP_MS,
        );
      } else {
        timer = setTimeout(() => {
          setIsAnimating(false);
        }, 500);
      }
    }
    return () => clearTimeout(timer);
  }, [isAnimating, currentStepIndex, animationSteps]);

  const handleButtonClick = (val: string) => {
    setErrorMessage(null);
    setExpression((prev) => {
      // Ignore a second "." in the same number
      if (val === "." && prev.endsWith(".")) return prev;
      // "." (and digits right after a ".") keep building the same number
      if (val === "." || prev.endsWith(".")) return prev + val;
      return prev === "" || prev.endsWith(" ") ? prev + val : prev + " " + val;
    });
  };
  const handleClear = () => {
    setExpression("");
    setAnimationSteps([]);
    setCurrentStepIndex(0);
    setIsAnimating(false);
    setErrorMessage(null);
  };

  const handleRun = () => {
    setErrorMessage(null);
    const result = generateAnimationSteps(expression);

    if (!result.valid) {
      setErrorMessage(result.error || "Expresión RPN inválida.");
      return;
    }
    setAnimationSteps(result.steps);
    setCurrentStepIndex(0);
    setIsAnimating(true);
  };
  const activeState =
    animationSteps.length > 0 && currentStepIndex < animationSteps.length
      ? animationSteps[currentStepIndex]
      : createInitialState();

  const stack = activeState.stack;
  const nextIsMerge =
    currentStepIndex < animationSteps.length - 1 &&
    animationSteps[currentStepIndex + 1].stack.length === stack.length - 1;

  const mergeA = nextIsMerge ? stack[stack.length - 2] : undefined;
  const mergeB = nextIsMerge ? stack[stack.length - 1] : undefined;
  const mergeResult = nextIsMerge
    ? animationSteps[currentStepIndex + 1].stack[
        animationSteps[currentStepIndex + 1].stack.length - 1
      ]
    : undefined;
  const displayStack = nextIsMerge ? stack.slice(0, stack.length - 2) : stack;

  const isMergeResult =
    currentStepIndex > 0 &&
    animationSteps[currentStepIndex].stack.length <
      animationSteps[currentStepIndex - 1].stack.length;
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4 relative">
      {errorMessage && (
        <div
          data-testid="error-box"
          className="absolute top-6 z-50 animate-slide-up bg-red-950/90 border border-red-500/50 backdrop-blur-md text-red-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm"
        >
          <span className="text-xl">⚠️</span>
          <div className="flex-1 text-xs">
            <strong className="block font-semibold text-red-100">
              Error de sintaxis RPN
            </strong>
            {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white text-sm font-bold px-1.5 py-0.5 rounded-lg hover:bg-red-900/50 transition"
          >
            ✕
          </button>
        </div>
      )}

      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
          <div>
            <h1 className="text-sm font-semibold tracking-wider uppercase text-neutral-200">
              Calculadora RPN
            </h1>
            <p className="text-xs text-neutral-500">Visualizador & Animación</p>
          </div>
          <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-mono">
            {isAnimating
              ? `Paso ${currentStepIndex + 1}/${animationSteps.length}`
              : "Listo"}
          </span>
        </div>

        <div className="bg-neutral-950 p-4 flex flex-col gap-3 border-b border-neutral-800 font-mono">
          <div>
            <span className="text-xs text-neutral-500 block mb-1 uppercase tracking-wider">
              Expresión RPN:
            </span>
            <input
              type="text"
              data-testid="expression-input"
              value={expression}
              onChange={(e) => {
                setExpression(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Ej: 8 7 + 2 *"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-600 transition"
            />
          </div>

          <div
            data-testid="result-box"
            className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 h-40 flex flex-col justify-end overflow-y-auto"
          >
            <span className="text-xs text-neutral-500 mb-1">Pila actual:</span>
            {displayStack.length === 0 && !nextIsMerge ? (
              <span className="text-neutral-600 italic text-xs">
                Pila vacía (pulsa ANIMAR)
              </span>
            ) : (
              <div className="flex flex-col gap-1.5 text-right text-sm">
                {displayStack.map((val, idx) => {
                  const isMergeResultRow =
                    isMergeResult && idx === displayStack.length - 1;
                  return (
                    <div
                      key={`${idx}-${val}`}
                      className={`${
                        isMergeResultRow ? "" : "animate-slide-up "
                      }flex justify-between items-center`}
                    >
                      <span className="text-neutral-600 text-xs">
                        :{idx + 1}
                      </span>
                      <span className="font-bold text-emerald-400">
                        {formatResult(val)}
                      </span>
                    </div>
                  );
                })}

                {nextIsMerge &&
                  mergeA !== undefined &&
                  mergeB !== undefined &&
                  mergeResult !== undefined && (
                    <div className="relative flex flex-col gap-1.5">
                      <div className="animate-merge-a flex justify-between items-center">
                        <span className="text-neutral-600 text-xs">
                          :{stack.length - 1}
                        </span>
                        <span className="font-bold text-amber-300">
                          {formatResult(mergeA)}
                        </span>
                      </div>
                      <div className="animate-merge-b flex justify-between items-center">
                        <span className="text-neutral-600 text-xs">
                          :{stack.length}
                        </span>
                        <span className="font-bold text-amber-400">
                          {formatResult(mergeB)}
                        </span>
                      </div>
                      <div className="animate-merge-result absolute inset-x-0 bottom-0 flex justify-between items-center">
                        <span className="text-neutral-600 text-xs">
                          :{stack.length}
                        </span>
                        <span className="font-bold text-emerald-400">
                          {formatResult(mergeResult)}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 p-4 bg-neutral-900">
          <button
            data-testid="btn-ac"
            onClick={handleClear}
            className="bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/50 py-3 rounded-xl font-medium transition text-sm"
          >
            AC
          </button>
          <button
            data-testid="btn-backspace"
            onClick={() => setExpression((prev) => prev.slice(0, -1))}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-3 rounded-xl font-medium transition"
          >
            ⌫
          </button>
          <button
            data-testid="btn-divide"
            onClick={() => handleButtonClick("/")}
            className="bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-medium transition"
          >
            ÷
          </button>
          <button
            data-testid="btn-multiply"
            onClick={() => handleButtonClick("*")}
            className="bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-medium transition"
          >
            ×
          </button>

          <button
            data-testid="btn-7"
            onClick={() => handleButtonClick("7")}
            className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-medium transition"
          >
            7
          </button>
          <button
            data-testid="btn-8"
            onClick={() => handleButtonClick("8")}
            className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-medium transition"
          >
            8
          </button>
          <button
            data-testid="btn-9"
            onClick={() => handleButtonClick("9")}
            className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-medium transition"
          >
            9
          </button>
          <button
            data-testid="btn-subtract"
            onClick={() => handleButtonClick("-")}
            className="bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-medium transition"
          >
            -
          </button>

          <button
            data-testid="btn-4"
            onClick={() => handleButtonClick("4")}
            className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-medium transition"
          >
            4
          </button>
          <button
            data-testid="btn-5"
            onClick={() => handleButtonClick("5")}
            className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-medium transition"
          >
            5
          </button>
          <button
            data-testid="btn-6"
            onClick={() => handleButtonClick("6")}
            className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-medium transition"
          >
            6
          </button>
          <button
            data-testid="btn-add"
            onClick={() => handleButtonClick("+")}
            className="bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-medium transition"
          >
            +
          </button>

          <button
            data-testid="btn-1"
            onClick={() => handleButtonClick("1")}
            className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-medium transition"
          >
            1
          </button>
          <button
            data-testid="btn-2"
            onClick={() => handleButtonClick("2")}
            className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-medium transition"
          >
            2
          </button>
          <button
            data-testid="btn-3"
            onClick={() => handleButtonClick("3")}
            className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-medium transition"
          >
            3
          </button>

          <button
            data-testid="btn-animate"
            onClick={handleRun}
            disabled={isAnimating}
            className="row-span-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white rounded-xl font-bold flex items-center justify-center transition text-xs shadow-lg"
          >
            {isAnimating ? "..." : "ANIMAR"}
          </button>

          <button
            data-testid="btn-0"
            onClick={() => handleButtonClick("0")}
            className="col-span-2 bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-medium transition"
          >
            0
          </button>
          <button
            data-testid="btn-dot"
            onClick={() => handleButtonClick(".")}
            className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-medium transition"
          >
            .
          </button>
        </div>
      </div>
    </main>
  );
}
