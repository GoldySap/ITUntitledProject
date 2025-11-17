let currentIndex = 0;
let proj1 = true;
let proj2 = false;
let proj3 = false;
let proj4 = false;

updateActiveItem();

projectList.forEach((item, index) => {
    item.addEventListener("mouseover", () => {
    currentIndex = index;
    updateActiveItem();
    });
    item.addEventListener("click", () => {
    if (!item.classList.contains("locked")) {
        openTerminal(item.dataset.id);
    }
    });
});

function changeSelection(direction) {
    const total = projectList.length;
    let nextIndex = currentIndex;
    do {
    nextIndex = (nextIndex + direction + total) % total;
    } while (projectList[nextIndex].classList.contains("locked") && nextIndex !== currentIndex);

    currentIndex = nextIndex;
    updateActiveItem();
}

function updateActiveItem() {
    projectList.forEach((el) => el.classList.remove("active"));
    projectList[currentIndex].classList.add("active");
}

function openTerminal(projectId) {
    alert("Opening terminal for: " + projectId);
    location.replace("../HTML/terminal.html")
}

function unlocked() {    
    if (proj1 == true) {
        locked1.classList.remove("locked");
    }
    if (proj2 == true) {
        locked2.classList.remove("locked");
    }
    if (proj3 == true) {
        locked3.classList.remove("locked");
    }
    if (proj4 == true) {
        locked4.classList.remove("locked");
    }
}

unlocked()