import { test, expect, type Page } from "@playwright/test";

/**
 * Test suite for the RPN Calculator
 * -------------------------------------------------------------
 * A single test runs the whole flow on ONE page: it checks the
 * initial state first, then runs every operation, error and input
 * management scenario, clearing the state with the AC button between
 * scenarios (no repeated goto, no new window per test).
 *
 * The skipped tests at the bottom cover operators that are not
 * implemented yet (% and ^).
 *
 * Useful command:
 *   npx playwright test --project=chromium
 */

/**
 * Fills the expression, presses ANIMAR and checks the result shown on
 * the stack. Then presses AC to reset the state so the SAME page can
 * be reused for the next scenario.
 */
async function runCalculation(
  page: Page,
  expression: string,
  expected: string,
) {
  await page.getByTestId("expression-input").fill(expression);
  await page.getByTestId("btn-animate").click();
  await expect(page.getByTestId("result-box")).toContainText(expected, {
    timeout: 15000,
  });
  // Reset the state for the next scenario
  await page.getByTestId("btn-ac").click();
}

/**
 * Fills an invalid expression, presses ANIMAR and checks the error
 * message shown in the error banner. Then presses AC to reset.
 */
async function runError(page: Page, expression: string, message: string) {
  await page.getByTestId("expression-input").fill(expression);
  await page.getByTestId("btn-animate").click();
  await expect(page.getByTestId("error-box")).toContainText(message);
  // Reset the state for the next scenario
  await page.getByTestId("btn-ac").click();
}

test("Calculadora RPN: flujo completo (una sola página)", async ({ page }) => {
  // The whole flow (many animations) takes ~40-45s, well over the 30s default
  test.setTimeout(120_000);

  // 0) Open the app ONCE (no new window per scenario)
  await page.goto("http://localhost:3000");

  // 1) Initial state (checked first)
  await expect(
    page.getByRole("heading", { name: "Calculadora RPN" }),
  ).toBeVisible();
  await expect(page.getByTestId("result-box")).toContainText(
    "Pila vacía (pulsa ANIMAR)",
  );
  await expect(page.getByTestId("btn-animate")).toBeEnabled();

  // 2) Arithmetic operations that work
  await runCalculation(page, "8 7 +", "15"); // sum
  await runCalculation(page, "6 7 *", "42"); // multiplication
  await runCalculation(page, "10 2 /", "5"); // exact division
  await runCalculation(page, "10 3 /", "3.33"); // rounded precision
  await runCalculation(page, "8 0 /", "Infinity"); // division by zero
  await runCalculation(page, "5 4 -", "1"); // subtraction
  await runCalculation(page, "8 7 + 2 *", "30"); // chained
  await runCalculation(page, "8 7.5 +", "15.5"); // decimals via input
  await runCalculation(page, "-5 3 +", "-2"); // negatives via input

  // 3) Errors that the app detects correctly
  await runError(page, "", "La expresión está vacía.");
  await runError(page, "8 7 x", "Token no válido");
  await runError(page, "8 +", "Faltan operandos");
  await runError(page, "8 7", "Expresión incompleta");

  // 4) Input management with the buttons
  // 4.1) Build an expression and remove the last char with ⌫
  await page.getByTestId("btn-8").click();
  await page.getByTestId("btn-7").click();
  await page.getByTestId("btn-add").click();
  await expect(page.getByTestId("expression-input")).toHaveValue("8 7 +");
  await page.getByTestId("btn-backspace").click();
  await expect(page.getByTestId("expression-input")).toHaveValue("8 7 ");
  await page.getByTestId("btn-ac").click();
  await expect(page.getByTestId("expression-input")).toHaveValue("");

  // 4.2) Decimals: the "." button joins the number being typed (2 . 5 2 + = 4.5)
  await page.getByTestId("btn-2").click();
  await page.getByTestId("btn-dot").click();
  await page.getByTestId("btn-5").click();
  await page.getByTestId("btn-2").click();
  await page.getByTestId("btn-add").click();
  await expect(page.getByTestId("expression-input")).toHaveValue("2.5 2 +");
  await page.getByTestId("btn-animate").click();
  await expect(page.getByTestId("result-box")).toContainText("4.5", {
    timeout: 15000,
  });
  await page.getByTestId("btn-ac").click();
});

test.describe("⏭️ Tests pendientes (skipped)", () => {
  test.skip("porcentaje: 50 10 % (operador no implementado)", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000");
    await page.getByTestId("expression-input").fill("50 10 %");
    await page.getByTestId("btn-animate").click();
    await expect(page.getByTestId("result-box")).toContainText("5");
  });

  test.skip("potencia: 2 3 ^ (operador no implementado)", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByTestId("expression-input").fill("2 3 ^");
    await page.getByTestId("btn-animate").click();
    await expect(page.getByTestId("result-box")).toContainText("8");
  });
});
