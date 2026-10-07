const welcomeScreen = document.getElementById("welcomeScreen");
const calculatorPage = document.getElementById("calculatorPage");

const startButton = document.getElementById("startButton");
const backButton = document.getElementById("backButton");

const display = document.getElementById("display");
const expression = document.getElementById("expression");

const buttons = document.querySelectorAll(".calc-button");

let currentValue = "0";
let previousValue = null;
let operator = null;
let waitingForOperand = false;
let expressionText = "";
 
startButton.addEventListener("click", () => {
welcomeScreen.classList.add("hide");

setTimeout(() => {
    welcomeScreen.style.display = "none";
    calculatorPage.classList.add("show");
}, 450);

});

backButton.addEventListener("click", () => {
calculatorPage.classList.remove("show");

setTimeout(() => {
    welcomeScreen.style.display = "flex";

    requestAnimationFrame(() => {
        welcomeScreen.classList.remove("hide");
    });
}, 250);

});


function updateDisplay() {
display.textContent = formatNumber(currentValue);

if (expressionText) {
    expression.textContent = expressionText;
} else {
    expression.textContent = "";
}

display.scrollLeft = display.scrollWidth;

}

function formatNumber(value) {
if (value === "Error") {
return value;
}

if (value === "Infinity" || value === "-Infinity") {
    return "Oops!";
}

const number = Number(value);

if (!Number.isFinite(number)) {
    return value;
}

if (
    value.endsWith(".") ||
    value.startsWith("0.") ||
    value === "-0"
) {
    return value;
}

if (Math.abs(number) >= 1e12 || (Math.abs(number) > 0 && Math.abs(number) < 1e-8)) {
    return number.toExponential(6);
}

return number.toLocaleString("en-US", {
    maximumFractionDigits: 10
});

}

function inputNumber(number) {

if (currentValue === "Error") {
    resetCalculator();
}

if (waitingForOperand) {
    currentValue = number;
    waitingForOperand = false;
} else {
    if (currentValue === "0") {
        currentValue = number;
    } else {
        currentValue += number;
    }
}

updateDisplay();

}


function inputDecimal() {


if (currentValue === "Error") {
    resetCalculator();
}

if (waitingForOperand) {
    currentValue = "0.";
    waitingForOperand = false;
    updateDisplay();
    return;
}

if (!currentValue.includes(".")) {
    currentValue += ".";
}

updateDisplay();

}


function chooseOperator(nextOperator) {


if (currentValue === "Error") {
    return;
}

const inputValue = Number(currentValue);

if (operator && waitingForOperand) {
    operator = nextOperator;
    expressionText = `${formatNumber(String(previousValue))} ${operatorSymbol(nextOperator)}`;
    updateDisplay();
    return;
}

if (previousValue === null) {
    previousValue = inputValue;
} else if (operator) {
    const result = calculate(previousValue, inputValue, operator);

    if (result === null) {
        showError();
        return;
    }

    currentValue = String(result);
    previousValue = result;
}

operator = nextOperator;
waitingForOperand = true;

expressionText =
    `${formatNumber(String(previousValue))} ${operatorSymbol(operator)}`;

updateDisplay();


}

function calculate(first, second, selectedOperator) {

 
switch (selectedOperator) {

    case "+":
        return first + second;

    case "-":
        return first - second;

    case "*":
        return first * second;

    case "/":
        if (second === 0) {
            return null;
        }

        return first / second;

    default:
        return second;
}
 

}

function performCalculation() {
 
if (
    operator === null ||
    previousValue === null ||
    waitingForOperand
) {
    return;
}

const secondValue = Number(currentValue);

const result = calculate(
    previousValue,
    secondValue,
    operator
);

if (result === null || !Number.isFinite(result)) {
    showError();
    return;
}

expressionText =
    `${formatNumber(String(previousValue))} ` +
    `${operatorSymbol(operator)} ` +
    `${formatNumber(String(secondValue))} =`;

currentValue = cleanResult(result);

previousValue = null;
operator = null;
waitingForOperand = true;

updateDisplay();
 

}

function calculatePercentage() {
 
if (currentValue === "Error") {
    return;
}

const value = Number(currentValue);

if (previousValue !== null && operator) {
    currentValue = String(
        previousValue * (value / 100)
    );
} else {
    currentValue = String(value / 100);
}

updateDisplay();
 

}

function deleteLast() {

if (waitingForOperand || currentValue === "Error") {
    return;
}

if (currentValue.length <= 1) {
    currentValue = "0";
} else {
    currentValue = currentValue.slice(0, -1);

    if (currentValue === "-" || currentValue === "") {
        currentValue = "0";
    }
}

updateDisplay();


}

function resetCalculator() {


currentValue = "0";
previousValue = null;
operator = null;
waitingForOperand = false;
expressionText = "";

updateDisplay();


}

function showError() {


currentValue = "Error";
previousValue = null;
operator = null;
waitingForOperand = true;
expressionText = "Can't do that! 😵";

updateDisplay();

setTimeout(() => {
    if (currentValue === "Error") {
        resetCalculator();
    }
}, 1500);


}

function cleanResult(number) {

const rounded =
    Number.parseFloat(Number(number).toPrecision(12));

return String(rounded);


}

function operatorSymbol(op) {


const symbols = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷"
};

return symbols[op] || op;


}

buttons.forEach(button => {

button.addEventListener("click", () => {

    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {

        if (value === ".") {
            inputDecimal();
            return;
        }

        if (
            value === "+" ||
            value === "-" ||
            value === "*" ||
            value === "/"
        ) {
            chooseOperator(value);
            return;
        }

        inputNumber(value);
        return;
    }

    switch (action) {

        case "clear":
            resetCalculator();
            break;

        case "delete":
            deleteLast();
            break;

        case "percent":
            calculatePercentage();
            break;

        case "calculate":
            performCalculation();
            break;
    }
});


});

document.addEventListener("keydown", event => {


const key = event.key;

if (/^[0-9]$/.test(key)) {
    inputNumber(key);
    return;
}
if (key === ".") {
    inputDecimal();
    return;
}
if (
    key === "+" ||
    key === "-" ||
    key === "*" ||
    key === "/"
) {
    chooseOperator(key);
    return;
}

if (key === "Enter" || key === "=") {
    event.preventDefault();
    performCalculation();
    return;
}
if (key === "Backspace") {
    deleteLast();
    return;
}
if (key === "Escape" || key === "Delete") {
    resetCalculator();
    return;
}
if (key === "%") {
    calculatePercentage();
}


});

updateDisplay();
