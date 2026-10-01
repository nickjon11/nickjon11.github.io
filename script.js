// =========================================================
// GLOBAL WINDOW STATE
// =========================================================

let highestZIndex = 100;

const windows = document.querySelectorAll(".window");
const desktopIcons = document.querySelectorAll(".desktop-icon");
const fileIcons = document.querySelectorAll(".file-icon");

const taskbarPrograms = document.getElementById("taskbar-programs");

const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");


// =========================================================
// CLOCK
// =========================================================

function updateClock() {

    const now = new Date();

    const time = now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });

    document.getElementById("clock").textContent = time;
}

updateClock();

setInterval(updateClock, 1000);


// =========================================================
// BRING WINDOW TO FRONT
// =========================================================

function focusWindow(windowElement) {

    windows.forEach(window => {
        window.classList.remove("active");
    });

    highestZIndex++;

    windowElement.style.zIndex = highestZIndex;
    windowElement.classList.add("active");

    updateTaskbarButtons();
}


// =========================================================
// OPEN WINDOW
// =========================================================

function openWindow(windowId) {

    const windowElement = document.getElementById(windowId);

    if (!windowElement) {
        return;
    }

    windowElement.style.display = "block";
    windowElement.dataset.minimized = "false";

    focusWindow(windowElement);

    createTaskbarButton(windowElement);

    closeStartMenu();
}


// =========================================================
// CLOSE WINDOW
// =========================================================

function closeWindow(windowElement) {

    windowElement.style.display = "none";
    windowElement.dataset.minimized = "false";

    const button = document.querySelector(
        `.taskbar-window-button[data-window="${windowElement.id}"]`
    );

    if (button) {
        button.remove();
    }

    activateTopWindow();
}


// =========================================================
// MINIMIZE WINDOW
// =========================================================

function minimizeWindow(windowElement) {

    windowElement.style.display = "none";
    windowElement.dataset.minimized = "true";

    windowElement.classList.remove("active");

    activateTopWindow();

    updateTaskbarButtons();
}


// =========================================================
// MAXIMIZE WINDOW
// =========================================================

function maximizeWindow(windowElement) {

    if (!windowElement.classList.contains("maximized")) {

        windowElement.dataset.previousTop = windowElement.style.top;
        windowElement.dataset.previousLeft = windowElement.style.left;
        windowElement.dataset.previousWidth = windowElement.style.width;
        windowElement.dataset.previousHeight = windowElement.style.height;

        windowElement.classList.add("maximized");

    } else {

        windowElement.classList.remove("maximized");

        windowElement.style.top =
            windowElement.dataset.previousTop || "";

        windowElement.style.left =
            windowElement.dataset.previousLeft || "";

        windowElement.style.width =
            windowElement.dataset.previousWidth || "";

        windowElement.style.height =
            windowElement.dataset.previousHeight || "";
    }

    focusWindow(windowElement);
}


// =========================================================
// ACTIVATE TOP VISIBLE WINDOW
// =========================================================

function activateTopWindow() {

    let topWindow = null;
    let topZ = -1;

    windows.forEach(window => {

        if (window.style.display === "block") {

            const z = Number(window.style.zIndex) || 0;

            if (z > topZ) {
                topZ = z;
                topWindow = window;
            }
        }
    });

    windows.forEach(window => {
        window.classList.remove("active");
    });

    if (topWindow) {
        topWindow.classList.add("active");
    }

    updateTaskbarButtons();
}


// =========================================================
// TASKBAR BUTTON
// =========================================================

function createTaskbarButton(windowElement) {

    const existingButton = document.querySelector(
        `.taskbar-window-button[data-window="${windowElement.id}"]`
    );

    if (existingButton) {
        updateTaskbarButtons();
        return;
    }

    const button = document.createElement("button");

    button.className = "taskbar-window-button";

    button.dataset.window = windowElement.id;

    button.textContent =
        windowElement.dataset.title || "Window";

    button.addEventListener("click", () => {

        if (
            windowElement.classList.contains("active") &&
            windowElement.style.display === "block"
        ) {

            minimizeWindow(windowElement);

        } else {

            windowElement.style.display = "block";
            windowElement.dataset.minimized = "false";

            focusWindow(windowElement);
        }
    });

    taskbarPrograms.appendChild(button);

    updateTaskbarButtons();
}


// =========================================================
// UPDATE TASKBAR
// =========================================================

function updateTaskbarButtons() {

    const buttons =
        document.querySelectorAll(".taskbar-window-button");

    buttons.forEach(button => {

        const windowElement =
            document.getElementById(button.dataset.window);

        if (
            windowElement &&
            windowElement.classList.contains("active") &&
            windowElement.style.display === "block"
        ) {

            button.classList.add("active");

        } else {

            button.classList.remove("active");
        }
    });
}


// =========================================================
// DESKTOP ICON DOUBLE CLICK
// =========================================================

desktopIcons.forEach(icon => {

    icon.addEventListener("dblclick", () => {

        openWindow(icon.dataset.window);

    });
});


// =========================================================
// PROJECT FOLDER DOUBLE CLICK
// =========================================================

fileIcons.forEach(icon => {

    icon.addEventListener("dblclick", () => {

        openWindow(icon.dataset.window);

    });
});


// =========================================================
// START MENU ITEMS
// =========================================================

document.querySelectorAll(".start-item[data-window]")
    .forEach(item => {

        item.addEventListener("click", () => {

            openWindow(item.dataset.window);

        });

    });


// =========================================================
// WINDOW BUTTONS
// =========================================================

windows.forEach(windowElement => {

    windowElement.addEventListener("mousedown", () => {

        focusWindow(windowElement);

    });


    const closeButton =
        windowElement.querySelector(".close-button");

    const minimizeButton =
        windowElement.querySelector(".minimize-button");

    const maximizeButton =
        windowElement.querySelector(".maximize-button");


    if (closeButton) {

        closeButton.addEventListener("click", event => {

            event.stopPropagation();

            closeWindow(windowElement);

        });
    }


    if (minimizeButton) {

        minimizeButton.addEventListener("click", event => {

            event.stopPropagation();

            minimizeWindow(windowElement);

        });
    }


    if (maximizeButton) {

        maximizeButton.addEventListener("click", event => {

            event.stopPropagation();

            maximizeWindow(windowElement);

        });
    }
});


// =========================================================
// DRAG WINDOWS
// =========================================================

windows.forEach(windowElement => {

    const titlebar =
        windowElement.querySelector(".window-titlebar");

    if (!titlebar) {
        return;
    }

    let dragging = false;

    let offsetX = 0;
    let offsetY = 0;


    titlebar.addEventListener("mousedown", event => {

        if (
            event.target.closest(".window-controls") ||
            windowElement.classList.contains("maximized")
        ) {
            return;
        }

        dragging = true;

        focusWindow(windowElement);

        const rect =
            windowElement.getBoundingClientRect();

        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        event.preventDefault();
    });


    document.addEventListener("mousemove", event => {

        if (!dragging) {
            return;
        }

        let newLeft =
            event.clientX - offsetX;

        let newTop =
            event.clientY - offsetY;


        const maxLeft =
            window.innerWidth - windowElement.offsetWidth;

        const maxTop =
            window.innerHeight -
            40 -
            windowElement.offsetHeight;


        newLeft =
            Math.max(0, Math.min(newLeft, maxLeft));

        newTop =
            Math.max(0, Math.min(newTop, maxTop));


        windowElement.style.left =
            `${newLeft}px`;

        windowElement.style.top =
            `${newTop}px`;
    });


    document.addEventListener("mouseup", () => {

        dragging = false;

    });
});


// =========================================================
// START BUTTON
// =========================================================

startButton.addEventListener("click", event => {

    event.stopPropagation();

    startMenu.classList.toggle("open");

    startButton.classList.toggle("active");

});


// =========================================================
// CLOSE START MENU
// =========================================================

function closeStartMenu() {

    startMenu.classList.remove("open");

    startButton.classList.remove("active");
}


document.addEventListener("mousedown", event => {

    if (
        !startMenu.contains(event.target) &&
        !startButton.contains(event.target)
    ) {

        closeStartMenu();
    }
});


// =========================================================
// HELP OK BUTTON
// =========================================================

const closeHelp =
    document.querySelector(".close-help");

if (closeHelp) {

    closeHelp.addEventListener("click", () => {

        const helpWindow =
            document.getElementById("help-window");

        closeWindow(helpWindow);

    });
}


// =========================================================
// RESTART WEBSITE
// =========================================================

const restartYes =
    document.getElementById("restart-yes");

const restartNo =
    document.getElementById("restart-no");


restartYes.addEventListener("click", () => {

    resetDesktop();

});


restartNo.addEventListener("click", () => {

    closeWindow(
        document.getElementById("restart-window")
    );

});


// =========================================================
// RESET DESKTOP
// =========================================================

function resetDesktop() {

    windows.forEach(windowElement => {

        windowElement.style.display = "none";

        windowElement.classList.remove(
            "active",
            "maximized"
        );

        windowElement.dataset.minimized = "false";

    });


    taskbarPrograms.innerHTML = "";

    closeStartMenu();


    /*
       Default window after restart.

       Currently this opens About Me.
    */

    openWindow("about-window");
}


// =========================================================
// DEFAULT STARTUP
// =========================================================

window.addEventListener("load", () => {

    /*
       Change this if you want a different
       window to appear when the website loads.
    */

    openWindow("about-window");

});