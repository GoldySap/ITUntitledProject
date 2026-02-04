const loginBtn = document.getElementById("login-btn");
const screens = {
  login: document.getElementById("login-screen"),
  loading: document.getElementById("loading-screen"),
  terminal: document.getElementById("terminal-screen")
};

function show(screen) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[screen].classList.add("active");
}

loginBtn.onclick = () => {
  show("loading");
  fakeLoading(() => show("terminal"));
};

function fakeLoading(done) {
  const text = document.getElementById("loading-text");
  let dots = 0;

  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    text.textContent = "Authenticating" + ".".repeat(dots);
  }, 400);

  setTimeout(() => {
    clearInterval(interval);
    done();
  }, 2500);
}

const output = document.getElementById("output");

function print(text, className = "") {
  const line = document.createElement("div");
  line.textContent = text;

  if (className) {
    line.classList.add(className);
  }

  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

const input = document.getElementById("command-input");

input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const cmd = input.value.trim();
    input.value = "";
    print(`${cwd} > ${cmd}`);
    handleCommand(cmd);
  }
});

const commands = {
  ls: {
    desc: "List directory contents",
    usage: "ls",
    run() {
      const dir = getDir(resolvePath());
      if (!dir) return print("[ERROR] Directory not found");

      Object.entries(dir.files).forEach(([name, item]) => {
        print(item.type === "directory" ? `${name}/` : `${name} (${item.size})`);
      });
    }
  },

  cd: {
    desc: "Change current directory",
    usage: "cd <path>",
    run(args) {
      const path = args[0] || "/";
      const resolved = resolvePath(path);
      const dir = getDir(resolved);

      if (!dir) print("[ERROR] No such directory");
      else cwd = "/" + resolved.join("/");
    }
  },

  pwd: {
    desc: "Print working directory",
    usage: "pwd",
    run() {
      print(cwd);
    }
  },

  open: {
    desc: "Open a file or executable",
    usage: "open <file>",
    run(args) {
      const file = args[0];
      if (!file) return print("Usage: open <file>");

      const dir = getDir(resolvePath());
      const entry = dir.files[file];

      if (!entry) return print("[ERROR] File not found");

      loadFileSequence(file, () => {
        if (file === "simulation.exe") openEXE("programs/index.html");
      });
    }
  },

  clear: {
    desc: "Clear the terminal output",
    usage: "clear",
    run() {
      output.innerHTML = "";
    }
  },

  help: {
    desc: "Show available commands",
    usage: "help [command]",
    run(args) {
      if (args[0]) {
        const cmd = commands[args[0]];
        if (!cmd) return print("[ERROR] Unknown command");

        print(`${args[0]} — ${cmd.desc}`);
        print(`Usage: ${cmd.usage}`);
        return;
      }

      print("Available commands:");
      Object.entries(commands).forEach(([name, cmd]) => {
        print(`  ${name.padEnd(12)} - ${cmd.desc}`);
      });
    }
  }
};

function handleCommand(input) {
  const [cmd, ...args] = input.split(" ");
  const command = commands[cmd];

  if (!command) {
    print("Unknown command");
    return;
  }

  command.run(args);
}


function sendToSimulation(type, payload = {}) {
  const frame = document.getElementById("program-frame");
  if (!frame || !frame.contentWindow) return;

  frame.contentWindow.postMessage({
    type,
    payload
  }, "*");
}

function openFile(file) {
  loadFileSequence(file, () => {
    if (file === "simulation.exe") {
      openEXE("program/index.html");
    }
  });
}

let cwd = "/";

function resolvePath(path) {
  if (!path || path === ".") return cwd.split("/").filter(Boolean);

  let parts = path.startsWith("/")
    ? path.split("/").filter(Boolean)
    : cwd.split("/").concat(path.split("/")).filter(Boolean);

  const stack = [];

  for (const part of parts) {
    if (part === "..") stack.pop();
    else if (part !== ".") stack.push(part);
  }

  return stack;
}

function getDir(pathArray) {
  let dir = fileSystem;

  for (const p of pathArray) {
    if (!dir.files[p] || dir.files[p].type !== "directory") {
      return null;
    }
    dir = dir.files[p];
  }

  return dir;
}

const fileSystem = {
  type: "directory",
  files: {
    "core.sys": { type: "file", size: "12KB" },
    "simulation.exe": { type: "file", size: "2.4MB", executable: true },
    "logs": {
      type: "directory",
      files: {
        "boot.log": { type: "file", size: "3KB" },
        "error.log": { type: "file", size: "1KB" }
      }
    },
    "data": {
      type: "directory",
      files: {
        "signals.dat": { type: "file", size: "6KB" }
      }
    }
  }
};


window.onload = () => {
  show("loading");
  bootSequence(() => show("login"));
};

function bootSequence(done) {
  const text = document.getElementById("loading-text");

  const lines = [
    "Powering system core...",
    "Initializing memory banks...",
    "Mounting file system...",
    "Verifying kernel integrity...",
    "System ready."
  ];

  let i = 0;

  const interval = setInterval(() => {
    text.textContent = lines[i];
    i++;

    if (i >= lines.length) {
      clearInterval(interval);
      setTimeout(done, 800);
    }
  }, 700);
}

let loadingInterrupted = false;

document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key.toLowerCase() === "c") {
    if (loadingInterrupted === false) {
      loadingInterrupted = true;
      print("^C");
      print("[ABORTED] Operation cancelled by user");
    }
  }
});

function loadFileSequence(file, onComplete) {
  loadingInterrupted = false;

  const steps = [
    "Allocating memory blocks",
    "Reading headers",
    "Resolving dependencies",
    "Streaming data",
    "Verifying checksum"
  ];

  let progress = 0;
  let stepIndex = 0;

  function bar(p) {
    const total = 10;
    const filled = Math.floor((p / 100) * total);
    return "█".repeat(filled) + "#".repeat(total - filled);
  }

  function step() {
    if (loadingInterrupted) return;

    if (stepIndex >= steps.length) {
        print(`[OK] ${file} mounted`, "success");
        onComplete?.();
        return;
    }

    const increment = Math.floor(Math.random() * 20) + 10;
    progress = Math.min(progress + increment, 100);

    if (Math.random() < 0.2) {
      print("[WARN] I/O latency spike detected");
    }

    print(
      `[LOAD] ${steps[stepIndex].padEnd(24)} [${bar(progress)}] ${progress}%`
    );

    stepIndex++;

    setTimeout(step, Math.random() * 700 + 400);
  }

  print(`[INIT] Loading ${file}`);
  step();
}

function printDelayed(text, delay = 20) {
  let i = 0;
  const interval = setInterval(() => {
    output.innerHTML += text[i++];
    output.scrollTop = output.scrollHeight;
    if (i >= text.length) {
      output.innerHTML += "\n";
      clearInterval(interval);
    }
  }, delay);
}

function printInline(text) {
  const lines = output.innerHTML.split("\n");
  lines[lines.length - 2] = text;
  output.innerHTML = lines.join("\n");
}

function openEXE(src) {
  const win = document.getElementById("simulation-window");
  const frame = document.getElementById("program-frame");

  frame.src = src;
  win.style.display = "block";
  input.focus(); 
}

function closeEXE() {

  const win = document.getElementById("simulation-window");
  const frame = document.getElementById("program-frame");

  frame.src = "";
  win.style.display = "none";

  print("[SHUTDOWN] aplication closed");
}

document.querySelector(".window-close").onclick = closeEXE;
const titleBar = document.querySelector(".window-titlebar");
const win = document.getElementById("simulation-window");

let isDragging = false, dragOffset = {x:0,y:0};

titleBar.addEventListener("mousedown", e => {
  isDragging = true;
  dragOffset.x = e.clientX - win.offsetLeft;
  dragOffset.y = e.clientY - win.offsetTop;
});

window.addEventListener("mouseup", () => isDragging = false);

window.addEventListener("mousemove", e => {
  if (!isDragging) return;
  win.style.left = e.clientX - dragOffset.x + "px";
  win.style.top = e.clientY - dragOffset.y + "px";
});

