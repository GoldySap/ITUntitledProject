const projects = document.querySelectorAll("td");

projects.forEach(td => {
td.addEventListener("click", () => {
    const target = td.getAttribute("data-link");
    if (target) {
        console.log(target);
        window.location.href = target;
    }
});
});