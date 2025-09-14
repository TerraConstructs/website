import { demos as precomputed } from "virtual:demo-precomputed";
import { GuidedTour } from "./guided-tour.js";
import { CodeView } from "./code-view.js";

let currentDemoData = null;
let currentDemoKey = null;
let currentTour = null;

// Code view instances for editor (input) and output
const inputView = new CodeView();
const outputView = new CodeView();

function startGuidedTourIfAppropriate(demoKey) {
  if (GuidedTour.shouldAutoStart()) {
    addTourStartButton(demoKey);
  }
}

function addTourStartButton(demoKey) {
  let tourBtn = document.getElementById("tourStartBtn");

  if (!tourBtn) {
    tourBtn = document.createElement("button");
    tourBtn.id = "tourStartBtn";
    tourBtn.className =
      "px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2";
    tourBtn.innerHTML =
      '<i data-lucide="play" class="w-4 h-4"></i><span>Start Tour</span>';
    tourBtn.title = "Get a guided explanation of this code";

    const tourContainer = document.getElementById("tourButtonContainer");
    if (tourContainer) {
      tourContainer.appendChild(tourBtn);
      if (window.refreshIcons) {
        window.refreshIcons(tourBtn);
      }
    }
  }

  tourBtn.onclick = () => startGuidedTour(demoKey);
}

export function startGuidedTour(demoKey) {
  if (currentTour) {
    currentTour.stop();
  }

  currentTour = new GuidedTour(demoKey, { runDemo });
  currentTour.start();

  const tourBtn = document.getElementById("tourStartBtn");
  if (tourBtn) {
    tourBtn.style.display = "none";
  }

  const originalStop = currentTour.stop.bind(currentTour);
  currentTour.stop = function () {
    originalStop();
    if (tourBtn) {
      tourBtn.style.display = "";
    }
  };
}

export function loadDemo(demoKey) {
  try {
    if (currentTour) {
      currentTour.stop();
      currentTour = null;
    }

    currentDemoData = precomputed[demoKey] || precomputed["workshop"];
    currentDemoKey = demoKey;

    const editor = document.getElementById("editor");
    const editorTitle = document.getElementById("editorTitle");
    const output = document.getElementById("output");
    const runStatus = document.getElementById("runStatus");
    const editorStats = document.getElementById("editorStats");

    if (editor && currentDemoData) {
      // Render precomputed HTML for input
      inputView.renderPrecomputed(currentDemoData.typescript, editor);

      if (editorTitle) {
        editorTitle.textContent = currentDemoData.fileName;
      }

      // Update stats after content is loaded
      setTimeout(() => {
        if (editorStats) {
          inputView.updateStats(editor, editorStats);
        }
        startGuidedTourIfAppropriate(demoKey);
      }, 100);
    } else {
      console.error("Failed to load demo data for:", demoKey);
      if (editor) {
        editor.innerHTML =
          '<div class="code-line"><span class="line-content">// Failed to load demo</span></div>';
      }
    }

    // Clear output and reset status
    if (output) {
      output.innerHTML =
        '<div class="code-line"><span class="line-content">/* Click Synth to see the synthesized Terraform */</span></div>';
    }
    if (runStatus) {
      runStatus.textContent = "Ready";
    }
  } catch (error) {
    console.error("Error loading demo:", error);
    const editor = document.getElementById("editor");
    if (editor) {
      editor.innerHTML = `<div class="code-line"><span class="line-content">// Error loading demo: ${error.message}</span></div>`;
    }
  }
}

export function runDemo() {
  if (!currentDemoData) return;

  const output = document.getElementById("output");
  const runStatus = document.getElementById("runStatus");
  const outputStats = document.getElementById("outputStats");

  if (runStatus) runStatus.textContent = "Synthesizing...";

  // Use requestAnimationFrame to show the "Synthesizing..." status
  window.requestAnimationFrame(() => {
    if (output) {
      outputView.renderPrecomputed(currentDemoData.terraform, output);
    }
    if (runStatus) runStatus.textContent = "Complete";

    if (outputStats) {
      outputView.updateStats(output, outputStats);
    }

    // Transition tour to output phase if applicable
    if (
      currentTour &&
      currentTour.isActive &&
      currentTour.currentPhase === "input"
    ) {
      setTimeout(() => {
        currentTour.transitionToOutput();
      }, 300);
    }
  });
}

function initCustomDropdown() {
  const button = document.getElementById("demoDropdownButton");
  const menu = document.getElementById("demoDropdownMenu");
  const text = document.getElementById("demoDropdownText");
  const options = menu?.querySelectorAll("[data-value]");

  if (!button || !menu || !text || !options) return;

  function toggleDropdown() {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", !isOpen);
    menu.classList.toggle("dropdown-show");
    if (!isOpen) options[0]?.focus();
  }

  function closeDropdown() {
    button.setAttribute("aria-expanded", "false");
    menu.classList.remove("dropdown-show");
  }

  function selectOption(value, displayText) {
    text.textContent = displayText;
    closeDropdown();
    loadDemo(value);
  }

  button.addEventListener("click", toggleDropdown);

  options.forEach(option => {
    option.addEventListener("click", e => {
      e.preventDefault();
      const value = option.getAttribute("data-value");
      const displayText = option.textContent.trim();
      selectOption(value, displayText);
    });
  });

  document.addEventListener("click", e => {
    if (!button.contains(e.target) && !menu.contains(e.target)) {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      if (isOpen) closeDropdown();
    }
  });

  button.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      if (button.getAttribute("aria-expanded") === "false") {
        toggleDropdown();
      }
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  menu.addEventListener("keydown", e => {
    const currentFocus = document.activeElement;
    const currentIndex = Array.from(options).indexOf(currentFocus);

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nextIndex =
          currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        options[nextIndex].focus();
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        options[prevIndex].focus();
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        currentFocus.click();
        break;
      }
      case "Escape": {
        e.preventDefault();
        closeDropdown();
        button.focus();
        break;
      }
    }
  });
}

export function initDemoSection() {
  const runBtn = document.getElementById("runBtn");
  const copyOutputBtn = document.getElementById("copyOutputBtn");

  if (runBtn) {
    runBtn.addEventListener("click", runDemo);
  }

  if (copyOutputBtn) {
    copyOutputBtn.addEventListener("click", async () => {
      const ok = await outputView.copyContent();
      if (ok) {
        copyOutputBtn.innerHTML =
          '<i data-lucide="check" class="w-4 h-4 text-green-600 dark:text-green-400"></i>';
        if (window.refreshIcons) window.refreshIcons(copyOutputBtn);
        setTimeout(() => {
          copyOutputBtn.innerHTML =
            '<i data-lucide="copy" class="w-4 h-4 text-gray-600 dark:text-gray-300"></i>';
          if (window.refreshIcons) window.refreshIcons(copyOutputBtn);
        }, 1200);
      }
    });
  }

  initCustomDropdown();

  setTimeout(() => {
    loadDemo("workshop");
  }, 100);
}

export function initDemoBadges() {
  const badges = ["demoBadge1", "demoBadge2", "demoBadge3"];

  function setActiveBadge(badgeId) {
    badges.forEach(id => {
      const badge = document.getElementById(id);
      if (badge) {
        badge.classList.remove("badge-active", "animate-badge-pulse");
        badge.classList.add("badge-inactive");
      }
    });

    const targetBadge = document.getElementById(badgeId);
    if (targetBadge) {
      targetBadge.classList.remove("badge-inactive");
      targetBadge.classList.add("badge-active");
    }
  }

  badges.forEach(badgeId => {
    const badge = document.getElementById(badgeId);
    if (badge) {
      badge.addEventListener("mouseenter", () => {
        setActiveBadge(badgeId);
      });
    }
  });

  setActiveBadge("demoBadge1");
}
