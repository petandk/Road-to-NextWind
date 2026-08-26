export interface RPNState {
  stack: number[];
  inputBuffer: string;
}

export interface RPNAnimationResult {
  steps: RPNState[];
  valid: boolean;
  error?: string;
}

export const createInitialState = (): RPNState => ({
  stack: [],
  inputBuffer: "",
});

export function handleDigit(state: RPNState, digit: string): RPNState {
  if (digit === "." && state.inputBuffer.includes(".")) {
    return state;
  }
  return {
    ...state,
    inputBuffer: state.inputBuffer + digit,
  };
}

export function handleEnter(state: RPNState): RPNState {
  if (state.inputBuffer === "") {
    if (state.stack.length === 0) return state;
    const lastElement = state.stack[state.stack.length - 1];
    return {
      ...state,
      stack: [...state.stack, lastElement],
    };
  }
  const num = parseFloat(state.inputBuffer);
  if (isNaN(num)) return state;
  return {
    stack: [...state.stack, num],
    inputBuffer: "",
  };
}

export function handleOperator(
  state: RPNState,
  operator: "+" | "-" | "*" | "/",
): RPNState {
  let currentState = state;
  if (currentState.inputBuffer !== "") currentState = handleEnter(currentState);
  if (currentState.stack.length < 2) return currentState;
  const newStack = [...currentState.stack];
  const b = newStack.pop()!;
  const a = newStack.pop()!;
  let result = 0;
  switch (operator) {
    case "+":
      result = a + b;
      break;
    case "-":
      result = a - b;
      break;
    case "*":
      result = a * b;
      break;
    case "/":
      if (b === 0) return currentState;
      result = a / b;
      break;
  }
  return {
    stack: [...newStack, result],
    inputBuffer: "",
  };
}

export function generateAnimationSteps(expression: string): RPNAnimationResult {
  const tokens = expression.trim().split(/\s+/);
  if (tokens.length === 0 || tokens[0] === "")
    return { steps: [], valid: false, error: "La expresión está vacía." };
  let currentState = createInitialState();
  const steps: RPNState[] = [currentState];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (["+", "-", "*", "/"].includes(token)) {
      if (currentState.stack.length < 2 && currentState.inputBuffer === "") {
        return {
          steps,
          valid: false,
          error: `Error en el token "${token}" (posicion ${i + 1}): Faltan operandos en la pila.`,
        };
      }
      currentState = handleOperator(
        currentState,
        token as "+" | "-" | "*" | "/",
      );
    } else {
      const num = parseFloat(token);
      if (isNaN(num))
        return {
          steps,
          valid: false,
          error: `Token no válido "${token}" no es un número ni un operador.`,
        };
      for (const char of token) {
        currentState = handleDigit(currentState, char);
      }
      currentState = handleEnter(currentState);
    }
    steps.push(currentState);
  }
  if (currentState.stack.length > 1) {
    return {
      steps,
      valid: false,
      error: `Expresión incompleta quedan números sin operar.`,
    };
  }
  return { steps, valid: true };
}
