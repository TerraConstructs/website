// Syntax highlighting setup using highlight.js
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'
import go from 'highlight.js/lib/languages/go'
import python from 'highlight.js/lib/languages/python'
import { definer as terraform } from '@taga3s/highlightjs-terraform'
import { demos as precomputed } from 'virtual:demo-precomputed'
import { GuidedTour } from './guided-tour.js'
import { CodeRenderer } from './html-code-renderer.js'

// Register languages
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('go', go)
hljs.registerLanguage('python', python)
hljs.registerLanguage('hcl', terraform)

// Code snippets
const codeSnippets = {
  ts: `import { Construct } from "constructs";
import { AwsStack, AwsStackProps } from 'terraconstructs/lib/aws';
import {
  Code,
  LambdaFunction,
  Runtime,
  LambdaRestApi,
} from 'terraconstructs/lib/aws/compute';

export class CdkWorkshopStack extends AwsStack {
  constructor(scope: Construct, id: string, props: AwsStackProps) {
    super(scope, id, props);

    const hello = new LambdaFunction(this, "HelloHandler", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

    new LambdaRestApi(this, "Endpoint", {
      cloudWatchRole: false,
      handler: hello,
      registerOutputs: true,
    });
  }
}`,

  go: `package main

import (
	"github.com/terraconstructs/base-go/aws"
	"github.com/terraconstructs/base-go/aws/compute"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type CdkWorkshopStackProps struct {
	aws.AwsStackProps
}

func NewCdkWorkshopStack(scope constructs.Construct, id string, props CdkWorkshopStackProps) aws.AwsStack {
	stack := aws.NewAwsStack(scope, &id, props.AwsStackProps)
	
	helloHandler := compute.NewLambdaFunction(stack, jsii.String("HelloHandler"), &compute.LambdaFunctionProps{
		Code:    compute.Code_FromAsset(jsii.String("lambda"), nil),
		Runtime: compute.Runtime_NODEJS_22_X(),
		Handler: jsii.String("hello.handler"),
	})
	
	compute.NewLambdaRestApi(stack, jsii.String("Endpoint"), &compute.LambdaRestApiProps{
		Handler: helloHandler,
	})
	
	return stack
}`,

  py: `from constructs import Construct
from terraconstructs import aws

class CdkWorkshopStack(aws.AwsStack):
    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        my_lambda = aws.compute.LambdaFunction(
            self, 'HelloHandler',
            runtime=aws.compute.Runtime.PYTHON_3_13,
            code=aws.compute.Code.from_asset('lambda'),
            handler='hello.handler',
        )

        aws.compute.LambdaRestApi(
            self, 'Endpoint',
            handler=my_lambda,
        )`
};

// Highlight and render code
function renderCode(language) {
  const snippetEl = document.getElementById('snippet');
  const buttons = document.querySelectorAll('[data-snippet]');
  const copyBtn = document.getElementById('copySnippet');
  
  if (!snippetEl) return;
  
  const code = codeSnippets[language];
  const highlightedCode = hljs.highlight(code, { language: language === 'ts' ? 'typescript' : language }).value;
  
  snippetEl.innerHTML = `<code class="hljs block font-mono text-sm leading-6">${highlightedCode}</code>`;
  
  // Update button states
  buttons.forEach(btn => {
    const isActive = btn.dataset.snippet === language;
    btn.classList.toggle('bg-accent', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('bg-white', !isActive);
    btn.classList.toggle('dark:bg-black', !isActive);
  });
  
  // Store current language for copy functionality
  snippetEl.dataset.lang = language;
}

// Copy functionality
async function copyCode() {
  const snippetEl = document.getElementById('snippet');
  const copyBtn = document.getElementById('copySnippet');
  const language = snippetEl?.dataset.lang || 'ts';
  const code = codeSnippets[language];
  
  try {
    await navigator.clipboard.writeText(code);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 1200);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

// Legacy function - no longer needed with HTML renderer
function highlightDemoEditor() {
  // This function is now handled by the CodeRenderer class
  console.log('highlightDemoEditor is deprecated - using HTML renderer instead')
}

// Initialize syntax highlighting
export function initHighlighting() {
  // Set up button event listeners
  document.querySelectorAll('[data-snippet]').forEach(btn => {
    btn.addEventListener('click', () => {
      renderCode(btn.dataset.snippet)
    })
  })
  
  // Set up copy button
  const copyBtn = document.getElementById('copySnippet')
  if (copyBtn) {
    copyBtn.addEventListener('click', copyCode)
  }
  
  // Initial render
  renderCode('ts')
  
  // Initialize demo editor highlighting
  highlightDemoEditor()
}

// Demo functionality for interactive demo section
let currentDemoData = null
let currentDemoKey = null
let currentTour = null

// Code renderer instances
const inputRenderer = new CodeRenderer()
const outputRenderer = new CodeRenderer()

// Legacy utility functions - now handled by CodeRenderer
function countLines(text) {
  if (!text || typeof text !== 'string') return 0
  return text.split('\n').length
}

// Legacy function - now handled by CodeRenderer.updateStats()
function updateStats() {
  console.log('updateStats is deprecated - using CodeRenderer.updateStats() instead')
}

function loadDemo(demoKey) {
  try {
    // Stop any existing tour
    if (currentTour) {
      currentTour.stop()
      currentTour = null
    }

    currentDemoData = precomputed[demoKey] || precomputed['workshop']
    currentDemoKey = demoKey
    
    const editor = document.getElementById('editor')
    const editorTitle = document.getElementById('editorTitle')
    const output = document.getElementById('output')
    const runStatus = document.getElementById('runStatus')
    const editorStats = document.getElementById('editorStats')
    
    if (editor && currentDemoData) {
      // Render precomputed HTML
      inputRenderer.renderPrecomputed(currentDemoData.typescript, editor)
      
      if (editorTitle) {
        editorTitle.textContent = currentDemoData.fileName
      }
      
      // Update stats after content is loaded
      setTimeout(() => {
        if (editorStats) {
          inputRenderer.updateStats(editor, editorStats)
        }
        startGuidedTourIfAppropriate(demoKey)
      }, 100)
    } else {
      console.error('Failed to load demo data for:', demoKey)
      if (editor) {
        editor.innerHTML = '<div class="code-line"><span class="line-content">// Failed to load demo</span></div>'
      }
    }
    
    // Clear output and reset status
    if (output) {
      output.innerHTML = '<div class="code-line"><span class="line-content">/* Click Run to see the synthesized Terraform */</span></div>'
    }
    if (runStatus) {
      runStatus.textContent = 'Ready'
    }
  } catch (error) {
    console.error('Error loading demo:', error)
    const editor = document.getElementById('editor')
    if (editor) {
      editor.innerHTML = `<div class="code-line"><span class="line-content">// Error loading demo: ${error.message}</span></div>`
    }
  }
}

export function runDemo() {
  if (!currentDemoData) return
  
  const output = document.getElementById('output')
  const runStatus = document.getElementById('runStatus')
  const outputStats = document.getElementById('outputStats')
  
  if (runStatus) runStatus.textContent = 'Synthesizing...'
  
  // Use requestAnimationFrame to show the "Synthesizing..." status
  window.requestAnimationFrame(() => {
    if (output) {
      outputRenderer.renderPrecomputed(currentDemoData.terraform, output)
    }
    if (runStatus) runStatus.textContent = 'Complete'
    
    // Update stats after output is generated
    if (outputStats) {
      outputRenderer.updateStats(output, outputStats)
    }
    
    // Transition tour to output phase if tour is active
    if (currentTour && currentTour.isActive && currentTour.currentPhase === 'input') {
      setTimeout(() => {
        currentTour.transitionToOutput()
      }, 300)
    }
  })
}

// Guided tour management
function startGuidedTourIfAppropriate(demoKey) {
  // Only auto-start tour for first-time visitors or when explicitly requested
  if (GuidedTour.shouldAutoStart()) {
    // Add a small tour start button
    addTourStartButton(demoKey)
  }
}

function addTourStartButton(demoKey) {
  // Check if tour start button already exists
  let tourBtn = document.getElementById('tourStartBtn')
  
  if (!tourBtn) {
    // Create tour start button
    tourBtn = document.createElement('button')
    tourBtn.id = 'tourStartBtn'
    tourBtn.className = 'btn bg-accent text-white text-sm focus-ring ml-2'
    tourBtn.textContent = 'Guide me'
    tourBtn.title = 'Get a guided explanation of this code'
    
    // Add to the tour button container next to dropdown
    const tourContainer = document.getElementById('tourButtonContainer')
    if (tourContainer) {
      tourContainer.appendChild(tourBtn)
    }
  }
  
  // Update button click handler for current demo
  tourBtn.onclick = () => startGuidedTour(demoKey)
}

function startGuidedTour(demoKey) {
  // Stop any existing tour
  if (currentTour) {
    currentTour.stop()
  }
  
  // Create and start new tour
  currentTour = new GuidedTour(demoKey)
  currentTour.start()
  
  // Hide the tour start button during tour
  const tourBtn = document.getElementById('tourStartBtn')
  if (tourBtn) {
    tourBtn.style.display = 'none'
  }
  
  // Show tour button again when tour completes
  const originalStop = currentTour.stop.bind(currentTour)
  currentTour.stop = function() {
    originalStop()
    if (tourBtn) {
      tourBtn.style.display = ''
    }
  }
}

// Custom dropdown functionality
function initCustomDropdown() {
  const button = document.getElementById('demoDropdownButton')
  const menu = document.getElementById('demoDropdownMenu')
  const text = document.getElementById('demoDropdownText')
  const options = menu?.querySelectorAll('[data-value]')
  
  if (!button || !menu || !text || !options) return
  
  // Toggle dropdown
  function toggleDropdown() {
    const isOpen = button.getAttribute('aria-expanded') === 'true'
    button.setAttribute('aria-expanded', !isOpen)
    menu.classList.toggle('dropdown-show')
    
    if (!isOpen) {
      // Focus first option when opening
      options[0]?.focus()
    }
  }
  
  // Close dropdown
  function closeDropdown() {
    button.setAttribute('aria-expanded', 'false')
    menu.classList.remove('dropdown-show')
    // Removed button.focus() to prevent unwanted page scrolling
  }
  
  // Select option
  function selectOption(value, displayText) {
    text.textContent = displayText
    closeDropdown()
    loadDemo(value) // Load the selected demo
  }
  
  // Button click
  button.addEventListener('click', toggleDropdown)
  
  // Option clicks
  options.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault()
      const value = option.getAttribute('data-value')
      const displayText = option.textContent.trim()
      selectOption(value, displayText)
    })
  })
  
  // Close on outside click
  document.addEventListener('click', (e) => {
    // Only close dropdown if it's actually open and click is outside
    if (!button.contains(e.target) && !menu.contains(e.target)) {
      const isOpen = button.getAttribute('aria-expanded') === 'true'
      if (isOpen) {
        closeDropdown()
      }
    }
  })
  
  // Keyboard navigation
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (button.getAttribute('aria-expanded') === 'false') {
        toggleDropdown()
      }
    } else if (e.key === 'Escape') {
      closeDropdown()
    }
  })
  
  // Menu keyboard navigation
  menu.addEventListener('keydown', (e) => {
    const currentFocus = document.activeElement
    const currentIndex = Array.from(options).indexOf(currentFocus)
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
        options[nextIndex].focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
        options[prevIndex].focus()
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        currentFocus.click()
        break
      case 'Escape':
        e.preventDefault()
        closeDropdown()
        button.focus() // Focus button when user explicitly closes with Escape
        break
    }
  })
}

function initDemoSection() {
  const runBtn = document.getElementById('runBtn')
  
  if (runBtn) {
    runBtn.addEventListener('click', runDemo)
  }
  
  // Initialize custom dropdown
  initCustomDropdown()
  
  // Load initial demo after a short delay to ensure everything is ready
  setTimeout(() => {
    loadDemo('workshop')
    // Initialize stats display
    updateStats()
  }, 100)
}

// Badge state management for demo section
function initDemoBadges() {
  let activeBadge = 'demoBadge1' // First badge is active by default
  const badges = ['demoBadge1', 'demoBadge2', 'demoBadge3']
  
  // Function to set active badge
  function setActiveBadge(badgeId) {
    // Remove active class from all badges
    badges.forEach(id => {
      const badge = document.getElementById(id)
      if (badge) {
        badge.classList.remove('badge-active', 'animate-badge-pulse')
        badge.classList.add('badge-inactive')
      }
    })
    
    // Add active class to the specified badge
    const targetBadge = document.getElementById(badgeId)
    if (targetBadge) {
      targetBadge.classList.remove('badge-inactive')
      targetBadge.classList.add('badge-active')
      activeBadge = badgeId
    }
  }
  
  // Add hover listeners to all badges
  badges.forEach(badgeId => {
    const badge = document.getElementById(badgeId)
    if (badge) {
      badge.addEventListener('mouseenter', () => {
        setActiveBadge(badgeId)
      })
    }
  })
  
  // Initialize first badge as active
  setActiveBadge('demoBadge1')
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHighlighting()
    initDemoSection()
    initDemoBadges()
  })
} else {
  initHighlighting()
  initDemoSection()
  initDemoBadges()
}
