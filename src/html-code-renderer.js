// HTML Code Renderer for precomputed TypeScript and HCL HTML

export class CodeRenderer {
  constructor() {
    // Store rendered code for reference
    this.currentContent = ''
    this.currentLanguage = ''
  }

  /**
   * Render code as HTML with line-based structure for precise highlighting
   * @param {string} code - Raw code content
   * @param {string} language - Language for syntax highlighting ('typescript' or 'hcl')
   * @param {HTMLElement} container - Container element to render into
   * @param {Object} tourConfig - Optional tour configuration with inputSteps/outputSteps
   */
  renderPrecomputed(precomputed, container) {
    if (!precomputed || !container) return
    this.currentContent = precomputed.raw || ''
    this.currentLanguage = precomputed.language || ''
    container.innerHTML = precomputed.html || ''
    container.className = `code-renderer ${this.currentLanguage}-code`
    this.styleContainer(container)
  }

  /**
   * Create tour segment structure with line ranges wrapped in containers
   */
  // Tour segment structure is precomputed and embedded in the HTML

  /**
   * Create a single line element with syntax highlighting
   */
  // Line elements are pre-rendered in the HTML

  /**
   * Style the container to match textarea appearance
   */
  styleContainer(container) {
    // Apply styles that match the original textarea
    container.style.fontFamily = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace'
    container.style.fontSize = '0.875rem'
    container.style.lineHeight = '1.35'
    container.style.padding = '0.75rem'
    container.style.whiteSpace = 'normal'
    container.style.overflowX = 'auto'
    container.style.overflowY = 'auto'
    container.style.background = 'inherit'
    container.style.color = 'inherit'
    container.style.border = 'none'
    container.style.outline = 'none'
    container.style.resize = 'none'
    container.style.tabSize = '2'
    
    // Make it look clickable but readonly
    container.setAttribute('tabindex', '0')
    container.setAttribute('role', 'textbox')
    container.setAttribute('aria-readonly', 'true')
    container.setAttribute('aria-label', `${this.currentLanguage} code editor`)
  }

  /**
   * Get a specific line element by line number
   */
  getLineElement(container, lineNumber) {
    return container.querySelector(`[data-line-number="${lineNumber}"]`)
  }

  /**
   * Get elements that match a pattern (for pattern-based highlighting)
   */
  getElementsMatchingPattern(container, pattern) {
    const regex = new RegExp(pattern, 'gi')
    const matchingElements = []
    
    const lines = container.querySelectorAll('.code-line')
    lines.forEach(line => {
      const lineContent = line.textContent
      if (regex.test(lineContent)) {
        matchingElements.push(line)
      }
    })
    
    return matchingElements
  }

  /**
   * Scroll a specific line into view
   */
  scrollToLine(container, lineNumber, behavior = 'smooth') {
    const lineElement = this.getLineElement(container, lineNumber)
    if (lineElement) {
      lineElement.scrollIntoView({
        behavior,
        block: 'center',
        inline: 'start'
      })
    }
  }

  /**
   * Get line height for consistent spacing calculations
   */
  getLineHeight(container) {
    const firstLine = container.querySelector('.code-line')
    if (firstLine) {
      return firstLine.getBoundingClientRect().height
    }
    // Fallback calculation
    const computedStyle = window.getComputedStyle(container)
    const fontSize = parseFloat(computedStyle.fontSize) || 14
    const lineHeight = parseFloat(computedStyle.lineHeight) || 1.5
    return fontSize * lineHeight
  }

  /**
   * Get total number of lines
   */
  getLineCount(container) {
    return container.querySelectorAll('.code-line').length
  }

  /**
   * Get character count
   */
  getCharacterCount() {
    return this.currentContent.length
  }

  /**
   * Copy content to clipboard
   */
  async copyContent() {
    try {
      await navigator.clipboard.writeText(this.currentContent)
      return true
    } catch (error) {
      console.error('Failed to copy content:', error)
      return false
    }
  }

  /**
   * Utility: Escape HTML characters
   */
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * Add highlight overlay to specific lines
   */
  addLineHighlight(container, startLine, endLine, highlightClass = 'tour-line-highlight') {
    for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
      const lineElement = this.getLineElement(container, lineNum)
      if (lineElement) {
        lineElement.classList.add(highlightClass)
        lineElement.setAttribute('data-tour-highlighted', 'true')
      }
    }
  }

  /**
   * Remove all highlights from container
   */
  clearHighlights(container) {
    const highlightedElements = container.querySelectorAll('[data-tour-highlighted]')
    highlightedElements.forEach(element => {
      element.classList.remove('tour-line-highlight', 'tour-pattern-highlight')
      element.removeAttribute('data-tour-highlighted')
    })
  }

  /**
   * Add pattern-based highlighting
   */
  addPatternHighlight(container, pattern, highlightClass = 'tour-pattern-highlight') {
    const matchingElements = this.getElementsMatchingPattern(container, pattern)
    matchingElements.forEach(element => {
      element.classList.add(highlightClass)
      element.setAttribute('data-tour-highlighted', 'true')
    })
    return matchingElements
  }

  /**
   * Update stats display (line count, character count)
   */
  updateStats(container, statsElement) {
    if (!statsElement) return
    
    const lineCount = this.getLineCount(container)
    const charCount = this.getCharacterCount()
    statsElement.textContent = `${lineCount} lines, ${charCount} chars`
  }
}
