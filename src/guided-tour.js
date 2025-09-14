// Guided tour system for TerraConstructs demo section
import { demos as precomputed } from "virtual:demo-precomputed";

export class GuidedTour {
  constructor(demoKey, options = {}) {
    const fallback = precomputed["workshop"]?.tour || {
      inputSteps: [],
      outputSteps: [],
    };
    this.config = precomputed[demoKey]?.tour || fallback;
    this.currentPhase = "input"; // 'input' or 'output'
    this.currentStepIndex = 0;
    this.isActive = false;
    this.isComplete = false;
    this.tooltip = null;
    this.completionEl = null;
    this.highlightElements = [];
    this.intersectionObserver = null;
    this.repositionTimeout = null;
    this.scrollTimeout = null;
    this.isScrollingToSegment = false;
    this.segmentFocusTimeout = null;

    // Dependency injection for synthesis
    this.runDemo =
      typeof options.runDemo === "function" ? options.runDemo : null;
    // DOM elements
    this.editor = document.getElementById("editor");
    this.output = document.getElementById("output");
    this.editorHighlight = document.getElementById("editor-highlight");

    // Bind methods
    this.nextStep = this.nextStep.bind(this);
    this.previousStep = this.previousStep.bind(this);
    this.skipTour = this.skipTour.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleWindowScroll = this.handleWindowScroll.bind(this);
    this.throttledReposition = this.throttledReposition.bind(this);
  }

  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.isComplete = false;
    this.currentPhase = "input";
    this.currentStepIndex = 0;

    // Add event listeners
    document.addEventListener("keydown", this.handleKeyboard);
    window.addEventListener("resize", this.handleResize);
    // No window scroll handling; tooltips are anchored to containers
    this.editor?.addEventListener("scroll", this.handleScroll);
    this.output?.addEventListener("scroll", this.handleScroll);

    // Mount top controls
    this.mountControls();

    // Show first step
    this.showCurrentStep();

    // Add tour active class to body for styling
    document.body.classList.add("guided-tour-active");
  }

  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    this.isComplete = false;

    // Remove event listeners
    document.removeEventListener("keydown", this.handleKeyboard);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("scroll", this.handleWindowScroll);
    this.editor?.removeEventListener("scroll", this.handleScroll);
    this.output?.removeEventListener("scroll", this.handleScroll);

    // Clear any pending timeouts
    if (this.repositionTimeout) {
      clearTimeout(this.repositionTimeout);
      this.repositionTimeout = null;
    }

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }

    if (this.segmentFocusTimeout) {
      clearTimeout(this.segmentFocusTimeout);
      this.segmentFocusTimeout = null;
    }

    // Disconnect intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    // Clean up UI
    this.hideTooltip();
    if (this.completionEl) {
      this.completionEl.remove();
      this.completionEl = null;
    }
    this.clearHighlights();
    this.unmountControls();
    document.body.classList.remove("guided-tour-active");
  }

  nextStep() {
    const currentSteps = this.getCurrentSteps();

    if (this.currentStepIndex < currentSteps.length - 1) {
      this.currentStepIndex++;
      this.showCurrentStep();
    } else if (this.currentPhase === "input") {
      // Move to output phase
      this.transitionToOutput();
    } else {
      // Tour complete
      this.completeTour();
    }
  }

  previousStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.showCurrentStep();
    } else if (this.currentPhase === "output") {
      // Move back to input phase
      this.transitionToInput();
    }
  }

  skipTour() {
    this.stop();
  }

  restartTour() {
    if (!this.isActive) return;
    // Remove completion card if visible
    if (this.completionEl) {
      this.completionEl.remove();
      this.completionEl = null;
    }
    this.isComplete = false;
    this.currentPhase = "input";
    this.currentStepIndex = 0;
    this.showCurrentStep();
  }

  getCurrentSteps() {
    return this.currentPhase === "input"
      ? this.config.inputSteps
      : this.config.outputSteps;
  }

  getCurrentStep() {
    const steps = this.getCurrentSteps();
    return steps[this.currentStepIndex];
  }

  showCurrentStep() {
    const step = this.getCurrentStep();
    if (!step) return;

    // Clear previous highlights
    this.clearHighlights();

    // Create highlight
    this.createHighlight(step);

    // Show tooltip
    this.showTooltip(step);

    // Update top controls state
    this.updateControls();
  }

  createHighlight(step) {
    const targetContainer =
      this.currentPhase === "input" ? this.editor : this.output;

    if (!targetContainer) {
      console.error("Target container not found for tour step:", step.id);
      return;
    }

    // Use pre-created tour segments
    const tourSegment = targetContainer.querySelector(
      `[data-tour-id="${step.id}"]`
    );
    if (tourSegment) {
      tourSegment.classList.add("tour-active");
      this.highlightElements.push(tourSegment);
      // Ensure the segment visually spans the longest line inside it
      const maxChars = parseInt(
        tourSegment.getAttribute("data-max-chars") || "0",
        10
      );
      if (!Number.isNaN(maxChars) && maxChars > 0) {
        tourSegment.style.minWidth = `calc(var(--editor-gutter, calc(2ch + 0.5rem)) + ${maxChars}ch)`;
      }

      // Scroll segment into view
      tourSegment.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "start",
      });
      // No artificial delay; tooltip will show immediately
    } else {
      console.error("Tour segment not found for step:", step.id);
    }
  }

  // Removed delayed segment focus handling to keep tooltips snappy

  showTooltip(step) {
    this.hideTooltip();

    const tooltip = document.createElement("div");
    tooltip.className = "tour-tooltip";
    tooltip.setAttribute("role", "dialog");
    tooltip.setAttribute("aria-describedby", "tour-content");
    tooltip.innerHTML = this.createTooltipContent(step);

    // Advance on click anywhere on the tooltip
    tooltip.addEventListener("click", e => {
      e.stopPropagation();
      this.nextStep();
    });

    // Add inside the relevant container so it scrolls with it
    const container = this.currentPhase === "input" ? this.editor : this.output;
    if (!container) return;
    // Add to DOM before measuring
    tooltip.style.visibility = "hidden";
    tooltip.style.position = "absolute";
    tooltip.style.transform = "none";
    tooltip.style.opacity = "0";
    container.appendChild(tooltip);

    this.tooltip = tooltip;

    // Position and show tooltip immediately
    this.showTooltipForSegment(step);
  }

  showTooltipForSegment(step) {
    if (!this.tooltip || !this.isActive) return;

    // Position tooltip near the highlighted segment
    this.positionTooltip(this.tooltip, step);

    // Set up intersection observer to hide tooltip when segment goes out of view
    this.setupIntersectionObserver(step);

    // Animate in
    this.tooltip.style.visibility = "visible";
    this.tooltip.style.opacity = "1";
    requestAnimationFrame(() => {
      if (this.tooltip) {
        this.tooltip.classList.add("tour-tooltip-visible");
      }
    });
  }

  createTooltipContent(step) {
    // Minimal tooltip: content only; navigation is handled by top controls.
    return `
      <div id="tour-content" class="tour-tooltip-content">
        <p>${step.content}</p>
      </div>
    `;
  }

  positionTooltip(tooltip, step) {
    const container = this.currentPhase === "input" ? this.editor : this.output;
    const anchor =
      container?.querySelector(`[data-tour-id="${step.id}"]`) || container;
    if (!container || !anchor) {
      this.centerTooltip(tooltip);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();
    const gap = this.getResponsiveGap();

    const spaces = {
      top: anchorRect.top - containerRect.top,
      bottom: containerRect.bottom - anchorRect.bottom,
      left: anchorRect.left - containerRect.left,
      right: containerRect.right - anchorRect.right,
    };

    const placements = [
      { name: "bottom", ok: spaces.bottom >= tipRect.height + gap },
      { name: "top", ok: spaces.top >= tipRect.height + gap },
      { name: "right", ok: spaces.right >= tipRect.width + gap },
      { name: "left", ok: spaces.left >= tipRect.width + gap },
    ];
    const chosen = placements.find(p => p.ok) || placements[0];

    let top, left;
    switch (chosen.name) {
      case "bottom":
        top = anchorRect.bottom - containerRect.top + container.scrollTop + gap;
        left =
          anchorRect.left -
          containerRect.left +
          container.scrollLeft +
          (anchorRect.width - tipRect.width) / 2;
        break;
      case "top":
        top =
          anchorRect.top -
          containerRect.top +
          container.scrollTop -
          tipRect.height -
          gap;
        left =
          anchorRect.left -
          containerRect.left +
          container.scrollLeft +
          (anchorRect.width - tipRect.width) / 2;
        break;
      case "right":
        top =
          anchorRect.top -
          containerRect.top +
          container.scrollTop +
          (anchorRect.height - tipRect.height) / 2;
        left =
          anchorRect.right - containerRect.left + container.scrollLeft + gap;
        break;
      case "left":
      default:
        top =
          anchorRect.top -
          containerRect.top +
          container.scrollTop +
          (anchorRect.height - tipRect.height) / 2;
        left =
          anchorRect.left -
          containerRect.left +
          container.scrollLeft -
          tipRect.width -
          gap;
        break;
    }

    // Clamp within container viewport
    const minTop = container.scrollTop;
    const maxTop =
      container.scrollTop + (containerRect.height - tipRect.height);
    const minLeft = container.scrollLeft;
    const maxLeft =
      container.scrollLeft + (containerRect.width - tipRect.width);
    top = Math.max(minTop, Math.min(maxTop, top));
    left = Math.max(minLeft, Math.min(maxLeft, left));

    tooltip.style.top = `${Math.round(top)}px`;
    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.transform = "none";
    tooltip.style.maxWidth = this.getResponsiveMaxWidth();
    tooltip.style.visibility = "visible";
    tooltip.setAttribute("data-placement", chosen.name);
  }

  calculateOptimalPosition(anchorRect, tipRect) {
    const gap = this.getResponsiveGap();
    const viewportPadding = 12;

    // Define viewport bounds with padding
    const viewport = {
      top: viewportPadding,
      left: viewportPadding,
      right: window.innerWidth - viewportPadding,
      bottom: window.innerHeight - viewportPadding,
    };

    // Calculate available space in each direction from anchor
    const spaces = {
      top: anchorRect.top - viewport.top,
      bottom: viewport.bottom - anchorRect.bottom,
      left: anchorRect.left - viewport.left,
      right: viewport.right - anchorRect.right,
    };

    // Test positions in order of preference
    const positions = [
      {
        placement: "bottom",
        needsSpace: tipRect.height + gap,
        available: spaces.bottom,
      },
      {
        placement: "top",
        needsSpace: tipRect.height + gap,
        available: spaces.top,
      },
      {
        placement: "right",
        needsSpace: tipRect.width + gap,
        available: spaces.right,
      },
      {
        placement: "left",
        needsSpace: tipRect.width + gap,
        available: spaces.left,
      },
    ];

    // Find best placement (preferring those that fit completely)
    const fitting = positions.filter(p => p.available >= p.needsSpace);
    const chosen =
      fitting.length > 0
        ? fitting.sort((a, b) => b.available - a.available)[0]
        : positions.sort((a, b) => b.available - a.available)[0];

    let top, left;

    switch (chosen.placement) {
      case "bottom":
        top = anchorRect.bottom + gap;
        left = anchorRect.left + (anchorRect.width - tipRect.width) / 2;
        break;
      case "top":
        top = anchorRect.top - tipRect.height - gap;
        left = anchorRect.left + (anchorRect.width - tipRect.width) / 2;
        break;
      case "right":
        top = anchorRect.top + (anchorRect.height - tipRect.height) / 2;
        left = anchorRect.right + gap;
        break;
      case "left":
        top = anchorRect.top + (anchorRect.height - tipRect.height) / 2;
        left = anchorRect.left - tipRect.width - gap;
        break;
    }

    // Clamp to viewport bounds
    top = Math.max(
      viewport.top,
      Math.min(viewport.bottom - tipRect.height, top)
    );
    left = Math.max(
      viewport.left,
      Math.min(viewport.right - tipRect.width, left)
    );

    // Final overlap check - if still overlapping, use fallback position
    const overlaps = !(
      left + tipRect.width <= anchorRect.left ||
      left >= anchorRect.right ||
      top + tipRect.height <= anchorRect.top ||
      top >= anchorRect.bottom
    );

    if (overlaps && chosen.available < chosen.needsSpace) {
      // Use alternative placement or offset
      const fallback = this.getFallbackPosition(anchorRect, tipRect, viewport);
      return { ...fallback, placement: chosen.placement + "-fallback" };
    }

    return { top, left, placement: chosen.placement };
  }

  getFallbackPosition(anchorRect, tipRect, viewport) {
    // Position to the side with most space, even if it overlaps slightly
    const centerY = anchorRect.top + anchorRect.height / 2;
    const centerX = anchorRect.left + anchorRect.width / 2;

    // Prefer positioning to the right side of the screen
    const left =
      centerX < window.innerWidth / 2
        ? Math.min(anchorRect.right + 12, viewport.right - tipRect.width)
        : Math.max(anchorRect.left - tipRect.width - 12, viewport.left);

    const top = Math.max(
      viewport.top,
      Math.min(viewport.bottom - tipRect.height, centerY - tipRect.height / 2)
    );

    return { top, left };
  }

  centerTooltip(tooltip) {
    const container = this.currentPhase === "input" ? this.editor : this.output;
    if (!container) return;
    const tipRect = tooltip.getBoundingClientRect();
    const rect = container.getBoundingClientRect();
    const top = container.scrollTop + (rect.height - tipRect.height) / 2;
    const left = container.scrollLeft + (rect.width - tipRect.width) / 2;

    tooltip.style.top = `${Math.round(top)}px`;
    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.maxWidth = this.getResponsiveMaxWidth();
    tooltip.setAttribute("data-placement", "center");
  }

  getResponsiveGap() {
    return window.innerWidth < 768 ? 6 : 8;
  }

  getResponsiveMaxWidth() {
    if (window.innerWidth < 480) return "90vw";
    if (window.innerWidth < 768) return "85vw";
    return "340px";
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  clearHighlights() {
    this.highlightElements.forEach(element => {
      if (element && element.classList) {
        // Remove highlight classes and attributes
        element.classList.remove(
          "tour-line-highlight",
          "tour-pattern-highlight",
          "tour-active"
        );
        element.removeAttribute("data-tour-highlighted");
        element.removeAttribute("data-tour-step");
        element.style.removeProperty("min-width");
      }
    });
    this.highlightElements = [];
  }

  async transitionToOutput() {
    // This will be called when moving from input to output phase
    this.currentPhase = "output";
    this.currentStepIndex = 0;

    // Check if output exists, if not, auto-run synthesis
    const output = document.getElementById("output");
    const hasOutput =
      output &&
      output.children.length > 0 &&
      !output.textContent.includes("Click Synth to see");

    if (!hasOutput) {
      // Show loading state in tooltip
      this.showSynthesisLoadingState();

      try {
        // Auto-run synthesis
        await this.autoRunSynthesis();

        // Wait a moment for output to render
        setTimeout(() => {
          if (this.isActive) {
            this.showCurrentStep();
          }
        }, 300);
      } catch (err) {
        console.error("Auto-synthesis failed:", err);
        this.showSynthesisError();
      }
    } else {
      // Output already exists, proceed normally
      setTimeout(() => {
        if (this.isActive) {
          this.showCurrentStep();
        }
      }, 100);
    }
  }

  showSynthesisLoadingState() {
    this.hideTooltip();

    const tooltip = document.createElement("div");
    tooltip.className = "tour-tooltip";
    tooltip.setAttribute("role", "dialog");
    tooltip.innerHTML = `
      <div class="tour-tooltip-header">
        <h3 class="tour-tooltip-title">Generating Terraform...</h3>
      </div>
      <div class="tour-tooltip-content">
        <p>Running synthesis to generate the output for highlighting. This will take just a moment.</p>
      </div>
    `;

    tooltip.style.position = "fixed";
    tooltip.style.top = "50%";
    tooltip.style.left = "50%";
    tooltip.style.transform = "translate(-50%, -50%)";
    tooltip.style.zIndex = "1000";

    document.body.appendChild(tooltip);
    this.tooltip = tooltip;

    requestAnimationFrame(() => {
      tooltip.classList.add("tour-tooltip-visible");
    });
  }

  showSynthesisError() {
    this.hideTooltip();

    const tooltip = document.createElement("div");
    tooltip.className = "tour-tooltip";
    tooltip.setAttribute("role", "dialog");
    tooltip.innerHTML = `
      <div class="tour-tooltip-header">
        <h3 class="tour-tooltip-title">Synthesis Failed</h3>
      </div>
      <div class="tour-tooltip-content">
        <p>Unable to generate Terraform output automatically. The output phase of the tour will be skipped.</p>
      </div>
      <div class="tour-tooltip-actions">
        <button class="tour-next-btn btn bg-accent text-white" type="button">Continue Tour</button>
        <button class="tour-skip-btn btn" type="button">Skip Tour</button>
      </div>
    `;

    tooltip.style.position = "fixed";
    tooltip.style.top = "50%";
    tooltip.style.left = "50%";
    tooltip.style.transform = "translate(-50%, -50%)";
    tooltip.style.zIndex = "1000";

    document.body.appendChild(tooltip);
    this.tooltip = tooltip;

    // Add event listeners
    setTimeout(() => {
      const nextBtn = tooltip.querySelector(".tour-next-btn");
      const skipBtn = tooltip.querySelector(".tour-skip-btn");

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          // Skip to completion
          this.completeTour();
        });
        nextBtn.focus();
      }
      if (skipBtn) {
        skipBtn.addEventListener("click", this.skipTour);
      }
    }, 0);

    requestAnimationFrame(() => {
      tooltip.classList.add("tour-tooltip-visible");
    });
  }

  async autoRunSynthesis() {
    if (!this.runDemo) throw new Error("runDemo not provided to GuidedTour");

    return new Promise((resolve, reject) => {
      try {
        const checkForCompletion = () => {
          const runStatus = document.getElementById("runStatus");
          if (runStatus && runStatus.textContent === "Complete") {
            resolve();
          } else {
            setTimeout(checkForCompletion, 100);
          }
        };

        // Start the synthesis
        this.runDemo();

        // Start checking for completion
        setTimeout(checkForCompletion, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          reject(new Error("Synthesis timeout"));
        }, 10000);
      } catch (err) {
        reject(err);
      }
    });
  }

  transitionToInput() {
    this.currentPhase = "input";
    this.currentStepIndex = this.config.inputSteps.length - 1;
    this.showCurrentStep();
  }

  completeTour() {
    // Prevent duplicate completion handling
    if (this.isComplete) return;
    // Show completion message and keep it until user clicks or stops
    this.isComplete = true;
    this.showCompletionMessage();
    this.updateControls();
  }

  showCompletionMessage() {
    this.hideTooltip();
    // Avoid creating multiple completion elements
    if (this.completionEl) return;

    const completion = document.createElement("div");
    completion.className = "tour-completion";
    completion.innerHTML = `
      <div class="tour-completion-content">
        <h3>🎉 Tour Complete!</h3>
        <p>You've learned the basics of TerraConstructs L2 constructs and how they generate clean Terraform.</p>
      </div>
    `;

    completion.style.position = "fixed";
    completion.style.top = "50%";
    completion.style.left = "50%";
    completion.style.transform = "translate(-50%, -50%)";
    completion.style.zIndex = "1000";

    document.body.appendChild(completion);
    this.completionEl = completion;

    // Click anywhere on the completion card to stop the tour
    completion.addEventListener("click", () => this.stop());
  }

  handleKeyboard(event) {
    if (!this.isActive) return;
    // During completion, only allow Escape (stop) or 'r' (restart);
    // prevent additional Next/Right events from recreating the modal.
    if (this.isComplete) {
      if (event.key === "Escape") {
        event.preventDefault();
        this.skipTour();
      } else if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        this.restartTour();
      }
      return;
    }

    // Handle focus trapping within tooltip
    if (this.tooltip && event.key === "Tab") {
      this.handleFocusTrap(event);
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        this.skipTour();
        break;
      case "ArrowRight":
      case "Enter":
      case " ":
        // Only handle if not focused on a button to avoid conflicts
        if (!event.target.matches("button")) {
          event.preventDefault();
          this.nextStep();
        }
        break;
      case "ArrowLeft":
        if (!event.target.matches("button")) {
          event.preventDefault();
          this.previousStep();
        }
        break;
    }
  }

  handleFocusTrap(event) {
    if (!this.tooltip) return;

    const focusableElements = this.tooltip.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  handleResize() {
    if (this.isActive && this.tooltip) {
      // Reposition tooltip on resize
      const step = this.getCurrentStep();
      if (step) {
        this.positionTooltip(this.tooltip, step);
      }
    }
  }

  handleScroll() {
    this.throttledReposition();
  }

  handleWindowScroll() {
    this.throttledReposition();
  }

  throttledReposition() {
    if (!this.isActive || !this.tooltip) return;
    if (this.repositionTimeout) {
      clearTimeout(this.repositionTimeout);
    }
    this.repositionTimeout = setTimeout(() => {
      if (this.isActive && this.tooltip) {
        const step = this.getCurrentStep();
        if (step) {
          this.positionTooltip(this.tooltip, step);
        }
      }
      this.repositionTimeout = null;
    }, 32);
  }

  setupIntersectionObserver(step) {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    const container = this.currentPhase === "input" ? this.editor : this.output;
    const target = container?.querySelector(`[data-tour-id="${step.id}"]`);

    if (!target) return;

    this.intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && this.tooltip) {
            // Hide tooltip when target segment is out of view within container
            this.tooltip.style.opacity = "0";
            this.tooltip.style.pointerEvents = "none";
          } else if (entry.isIntersecting && this.tooltip) {
            this.tooltip.style.opacity = "1";
            this.tooltip.style.pointerEvents = "auto";
          }
        });
      },
      {
        root: container,
        rootMargin: "-10px",
        threshold: 0.1,
      }
    );

    this.intersectionObserver.observe(target);
  }

  // Top controls near the demo selector
  mountControls() {
    const host = document.getElementById("tourButtonContainer");
    if (!host) return;
    this.unmountControls();

    const el = document.createElement("div");
    el.className = "tour-controls flex items-center gap-2";
    el.innerHTML = `
      <button type="button" class="tour-prev-btn bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 rounded-lg font-medium inline-flex items-center justify-center gap-2 w-10 h-10 sm:w-auto sm:h-auto px-2 py-2 sm:px-4 sm:py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Back">
        <i data-lucide="chevron-left" class="w-4 h-4"></i>
        <span class="hidden sm:inline">Back</span>
      </button>
      <button type="button" class="tour-next-btn bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 rounded-lg font-medium inline-flex items-center justify-center gap-2 w-10 h-10 sm:w-auto sm:h-auto px-2 py-2 sm:px-4 sm:py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Next">
        <span class="hidden sm:inline">Next</span>
        <i data-lucide="chevron-right" class="w-4 h-4"></i>
      </button>
      <button type="button" class="tour-restart-btn bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 rounded-lg font-medium inline-flex items-center justify-center gap-2 w-10 h-10 sm:w-auto sm:h-auto px-2 py-2 sm:px-4 sm:py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Restart">
        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
        <span class="hidden sm:inline">Restart</span>
      </button>
      <button type="button" class="tour-skip-btn bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 rounded-lg font-medium inline-flex items-center justify-center gap-2 w-10 h-10 sm:w-auto sm:h-auto px-2 py-2 sm:px-4 sm:py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Stop">
        <i data-lucide="square" class="w-4 h-4"></i>
        <span class="hidden sm:inline">Stop</span>
      </button>
    `;
    host.appendChild(el);
    this.controlsEl = el;

    // Create tour status element next to dropdown
    const statusEl = document.createElement("span");
    statusEl.id = "tour-status";
    statusEl.className = "text-xs text-gray-500 dark:text-gray-400 font-mono";
    statusEl.setAttribute("aria-live", "polite");

    // Find the dropdown container and add status after it
    const dropdownContainer = host.parentElement?.querySelector(".relative");
    if (dropdownContainer) {
      dropdownContainer.appendChild(statusEl);
    }
    this.statusEl = statusEl;

    // Refresh icons for all new buttons
    if (window.refreshIcons) {
      window.refreshIcons(el);
    }

    el.querySelector(".tour-prev-btn")?.addEventListener(
      "click",
      this.previousStep
    );
    el.querySelector(".tour-next-btn")?.addEventListener(
      "click",
      this.nextStep
    );
    el.querySelector(".tour-restart-btn")?.addEventListener(
      "click",
      this.restartTour.bind(this)
    );
    el.querySelector(".tour-skip-btn")?.addEventListener(
      "click",
      this.skipTour
    );

    this.updateControls();
  }

  updateControls() {
    if (!this.controlsEl) return;
    const steps = this.getCurrentSteps();
    const isFirst =
      this.currentStepIndex === 0 && this.currentPhase === "input";
    const isLast =
      this.currentStepIndex === steps.length - 1 &&
      this.currentPhase === "output";

    const prevBtn = this.controlsEl.querySelector(".tour-prev-btn");
    const nextBtn = this.controlsEl.querySelector(".tour-next-btn");
    const nextBtnSpan = nextBtn?.querySelector("span");
    const status = this.statusEl;

    if (this.isComplete) {
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) {
        nextBtn.disabled = true;
        if (nextBtnSpan) nextBtnSpan.textContent = "Next";
        nextBtn.setAttribute("aria-label", "Next");
      }
      if (status) status.textContent = "Done";
      return;
    }

    if (prevBtn) prevBtn.disabled = isFirst;
    if (nextBtn) {
      nextBtn.disabled = false; // Never disable Next/Finish button during active tour
      nextBtn.setAttribute("aria-label", isLast ? "Finish" : "Next");
      if (nextBtnSpan) nextBtnSpan.textContent = isLast ? "Finish" : "Next";
    }
    if (status)
      status.textContent = `${
        this.currentPhase === "input" ? "Input" : "Output"
      } ${this.currentStepIndex + 1}/${steps.length}`;
  }

  unmountControls() {
    if (this.controlsEl) {
      this.controlsEl.remove();
      this.controlsEl = null;
    }
    if (this.statusEl) {
      this.statusEl.remove();
      this.statusEl = null;
    }
  }

  // Static method to check if a tour should auto-start
  static shouldAutoStart() {
    // Don't auto-start if user has dismissed tours before
    return !localStorage.getItem("tc-tour-dismissed");
  }

  // Static method to mark tours as dismissed
  static markTourDismissed() {
    localStorage.setItem("tc-tour-dismissed", "true");
  }
}
