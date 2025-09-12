// Main entry point for TerraConstructs landing page
import "./style.css";
import {
  initDemoSection,
  initDemoBadges,
  startGuidedTour,
} from "./demo-section.js";
import { initIcons } from "./icons.js";

// Dark mode: localStorage + system preference
const root = document.documentElement;
const THEME_KEY = "tc-theme";

const applyTheme = (t) => {
  const isDark =
    t === "dark" ||
    (t == null && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.setAttribute("aria-pressed", String(isDark));
  const btnMobile = document.getElementById("themeToggleMobile");
  if (btnMobile) btnMobile.setAttribute("aria-pressed", String(isDark));
};

// Initialize theme
applyTheme(localStorage.getItem(THEME_KEY));

// Theme toggle buttons (desktop and mobile)
const toggleTheme = () => {
  const next = root.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
};

document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
document
  .getElementById("themeToggleMobile")
  ?.addEventListener("click", toggleTheme);

// Logo click to scroll to top
document.getElementById("logoButton")?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// Current year for footer
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear().toString();
}

// Demo functionality is initialized below

// FAQ accordion functionality
function initFAQ() {
  const faqToggles = document.querySelectorAll(".faq-toggle");

  faqToggles.forEach((toggle) => {
    const panel = document.getElementById(toggle.getAttribute("aria-controls"));

    if (!panel) return;

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      // Close this panel or open it
      toggle.setAttribute("aria-expanded", String(!isOpen));

      if (!isOpen) {
        // Open panel
        panel.classList.remove("hidden");
        // Wait for next frame to allow hidden class to take effect
        requestAnimationFrame(() => {
          panel.style.maxHeight = panel.scrollHeight + "px";
          panel.style.opacity = "1";
        });
      } else {
        // Close panel
        panel.style.maxHeight = "0";
        panel.style.opacity = "0";
        setTimeout(() => {
          panel.classList.add("hidden");
        }, 150); // half of 0.3 transition
      }

      // Rotate chevron icon (handled by Lucide replacement)
      // The icon will be rotated via transform in CSS based on aria-expanded
    });
  });
}

// Initialize FAQ accordions
initFAQ();

// Mobile menu functionality
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileMenu = document.getElementById("mobileMenu");

if (mobileMenuButton && mobileMenu) {
  const toggleMobileMenu = () => {
    const isOpen = mobileMenuButton.getAttribute("aria-expanded") === "true";
    mobileMenuButton.setAttribute("aria-expanded", !isOpen);
    mobileMenuButton.setAttribute(
      "aria-label",
      !isOpen ? "Close menu" : "Open menu"
    );

    if (!isOpen) {
      // Open menu
      mobileMenu.classList.remove("opacity-0", "invisible");
      mobileMenu.classList.add("opacity-100", "visible");
      // Swap icons
      mobileMenuButton.querySelector(".icon-menu")?.classList.add("hidden");
      mobileMenuButton.querySelector(".icon-close")?.classList.remove("hidden");
      // Lock background scroll
      document.body.classList.add("menu-open");
    } else {
      // Close menu
      mobileMenu.classList.remove("opacity-100", "visible");
      mobileMenu.classList.add("opacity-0", "invisible");
      // Swap icons
      mobileMenuButton.querySelector(".icon-close")?.classList.add("hidden");
      mobileMenuButton.querySelector(".icon-menu")?.classList.remove("hidden");
      // Unlock background scroll
      document.body.classList.remove("menu-open");
    }
  };

  // Toggle menu on button click
  mobileMenuButton.addEventListener("click", toggleMobileMenu);

  // Close menu when clicking on menu links
  const mobileMenuLinks = mobileMenu.querySelectorAll("a");
  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenuButton.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("opacity-100", "visible");
      mobileMenu.classList.add("opacity-0", "invisible");
      mobileMenuButton.querySelector(".icon-close")?.classList.add("hidden");
      mobileMenuButton.querySelector(".icon-menu")?.classList.remove("hidden");
      document.body.classList.remove("menu-open");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !mobileMenuButton.contains(e.target) &&
      !mobileMenu.contains(e.target)
    ) {
      if (mobileMenuButton.getAttribute("aria-expanded") === "true") {
        mobileMenuButton.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("opacity-100", "visible");
        mobileMenu.classList.add("opacity-0", "invisible");
        mobileMenuButton.querySelector(".icon-close")?.classList.add("hidden");
        mobileMenuButton
          .querySelector(".icon-menu")
          ?.classList.remove("hidden");
        document.body.classList.remove("menu-open");
      }
    }
  });

  // Close with Escape key
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      mobileMenuButton.getAttribute("aria-expanded") === "true"
    ) {
      mobileMenuButton.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("opacity-100", "visible");
      mobileMenu.classList.add("opacity-0", "invisible");
      mobileMenuButton.querySelector(".icon-close")?.classList.add("hidden");
      mobileMenuButton.querySelector(".icon-menu")?.classList.remove("hidden");
      document.body.classList.remove("menu-open");
    }
  });
}

// Initialize demo section and badges
initDemoSection();
initDemoBadges();

// Connect hero "Start Interactive Tour" button to demo tour
const heroTourButton = document.getElementById("heroTourButton");
if (heroTourButton) {
  heroTourButton.addEventListener("click", () => {
    // Scroll to demo section
    const demoSection = document.getElementById("demo");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });

      // Wait for scroll to complete, then start tour
      setTimeout(() => {
        // Start the guided tour for the default demo
        startGuidedTour("workshop");
      }, 800); // Wait for smooth scroll to complete
    }
  });
}

// Initialize icons after everything else is loaded
window.addEventListener("load", () => {
  initIcons();
});

// Make icon refresh available globally
window.refreshIcons = (el) => initIcons(el);
