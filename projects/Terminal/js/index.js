const loginScreen = document.getElementById("login-screen");
const username = document.getElementById("username");
const password = document.getElementById("password");
const loadingScreen = document.getElementById("loading-screen");
const tui = document.getElementById("terminal-ui");
const header = document.getElementById("header");
const container = document.getElementById("container");
const sidebar = document.getElementById("sidebar");
const inputArea = document.getElementById("input-area");
const terminal = document.getElementById("terminal");
const input = document.getElementById("command-input");
const loadingText = document.getElementById("loading-text");
let selected = "";
let loadtext = "";
let clearanceLevel = 0;

const Logo = document.getElementById("logo");

const asciiArt = [
    "           -",
    "          / \\",
    "      /--/   \\--\\",
    "   /--  /     \\  --\\",
    "/--    /  [+]  \\    --\\",
    "\\--    \\  [+]  /    --/",
    "   \\--  \\     /  --/",
    "      \\--\\   /--/",
    "          \\ /",
    "           -"
];

let line = 0;
let char = 0;

function type() {
    if (line < asciiArt.length) {
    const currentLine = asciiArt[line];
        if (char < currentLine.length) {
            Logo.textContent += currentLine[char];
            char++;
            setTimeout(type, 15);
        } else {
            Logo.textContent += "\n";
            line++;
            char = 0;
            setTimeout(type, 150);
        }
    }
}

function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user && pass) {
    loginScreen.style.display = "none";
    loadingScreen.style.display = "flex";
    loadtext = "Booting VIREN terminal..."
    simulateLoading(() => {
        loadingScreen.style.display = "none";
        tui.style.display = "block";
        updateClearanceUI();
        loadtext = "";
        terminal.textContent = "Login successful.";
        print("Welcome to VIREN Terminal v1.0");
        print("Type Help for command list.");
    });
    } else {
    alert("Invalid credentials");
    }
}

function simulateLoading(callback) {
    let step = 0;
    const total = 10;
    const interval = setInterval(() => {
    step++;
    loadingText.textContent = loadtext + `\n[${"■".repeat(step)}${"□".repeat(total - step)}]`;
    if (step === total) {
        clearInterval(interval);
        setTimeout(callback, 500);
    }
    }, 200);
}

function print(text) {
    terminal.textContent += `\n${text}`;
    terminal.scrollTop = terminal.scrollHeight;
}

function runCommand(cmd) {
    const command = cmd.toLowerCase().trim();
    switch (command) {
        case "help":
                print("Commands: help, auth 1, auth 2, simulate, check, clear, exit");
                break;
        case "auth 1":
            if (clearanceLevel < 1) {
                clearanceLevel = 1;
                print("[AUTHORIZED] Clearance level 1 granted.");
                updateClearanceUI();
            } else {
                print("[INFO] Already level 1 or higher.");
            }
            break;
        case "auth 2":
            if (clearanceLevel >= 1 && clearanceLevel < 2) {
                clearanceLevel = 2;
                print("[AUTHORIZED] Clearance level 2 granted. UI lockdown activated.");
                updateClearanceUI();
            } else if (clearanceLevel < 1) {
                print("[ACCESS DENIED] Requires level 1 first.");
            } else {
                print("[INFO] Already level 2.");
            }
            break;
        case "simulate":
            if (clearanceLevel >= 1) {
                print("Launching simulation...");
                alert("Simulation started!");
            } else {
                print("[ACCESS DENIED] Requires clearance level 1.");
            }
            break;
        case "check":
            print("Current clearence level: " + clearanceLevel);
            break;
        case "clear":
            terminal.textContent = "VIREN Terminal v1.0\nType Help for command list.";
            break;
        case "exit":
            tui.style.display = "none";
            loadingScreen.style.display = "flex";
            username.value = '';
            password.value = '';
            loadtext = "Exiting secure terminal..."
            simulateLoading(() => {
                loadingScreen.style.display = "none";
                loginScreen.style.display = "flex";
                clearanceLevel = 0;
                updateClearanceUI();
                loadtext = "";
            });
            break;
        default:
            print(`[UNKNOWN COMMAND] '${command}'`);
    }
}

function updateClearanceUI() {
    document.querySelectorAll("#sidebar button").forEach(btn => btn.classList.add("hidden"));
    document.querySelectorAll(`.level-${clearanceLevel}`).forEach(btn => btn.classList.remove("hidden"));
    if (clearanceLevel >= 2) {
    sidebar.style.display = "none";
    }
}

input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        const val = input.value;
        print(`> ${val}`);
        runCommand(val);
        input.value = "";
    }
});

addEventListener("DOMContentLoaded", () => { 
    type();
})
