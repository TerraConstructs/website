// CodeView: Presents precomputed TypeScript and HCL HTML

export class CodeView {
  constructor() {
    // Store rendered code for reference
    this.currentContent = "";
    this.currentLanguage = "";
  }

  /**
   * Render code as HTML with line-based structure for precise highlighting
   * @param {string} code - Raw code content
   * @param {string} language - Language for syntax highlighting ('typescript' or 'hcl')
   * @param {HTMLElement} container - Container element to render into
   * @param {Object} tourConfig - Optional tour configuration with inputSteps/outputSteps
   */
  renderPrecomputed(precomputed, container) {
    if (!precomputed || !container) return;
    this.currentContent = precomputed.raw || "";
    this.currentLanguage = precomputed.language || "";
    container.innerHTML = precomputed.html || "";
    container.className = `code-renderer ${this.currentLanguage}-code`;
    this.styleContainer(container);
  }

  // Tour segment structure and line elements are pre-rendered in HTML

  // Style the container to match textarea appearance
  styleContainer(container) {
    // Apply styles that match the original textarea
    container.style.fontFamily =
      "JetBrains Mono, ui-monospace, SFMono-Regular, monospace";
    container.style.fontSize = "0.875rem";
    container.style.lineHeight = "var(--code-line-h)";
    container.style.padding = "0.75rem";
    container.style.whiteSpace = "normal";
    container.style.overflowX = "auto";
    container.style.overflowY = "auto";
    container.style.background = "inherit";
    container.style.color = "inherit";
    container.style.border = "none";
    container.style.outline = "none";
    container.style.resize = "none";
    container.style.tabSize = "2";

    // Make it look clickable but readonly
    container.setAttribute("tabindex", "0");
    container.setAttribute("role", "textbox");
    container.setAttribute("aria-readonly", "true");
    container.setAttribute("aria-label", `${this.currentLanguage} code editor`);
  }

  // Get total number of lines
  getLineCount(container) {
    return container.querySelectorAll(".code-line").length;
  }

  // Get character count
  getCharacterCount() {
    return this.currentContent.length;
  }

  // Copy content to clipboard
  async copyContent() {
    try {
      await navigator.clipboard.writeText(this.currentContent);
      return true;
    } catch (error) {
      console.error("Failed to copy content:", error);
      return false;
    }
  }

  // Update stats display (line count)
  updateStats(container, statsElement) {
    if (!statsElement) return;

    const lineCount = this.getLineCount(container);
    // Only show line count to avoid cramped titlebars on mobile
    statsElement.textContent = `${lineCount} lines`;
  }
}
