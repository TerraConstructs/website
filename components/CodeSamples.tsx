'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Copy, Check } from 'lucide-react'
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'
import go from 'highlight.js/lib/languages/go'
import python from 'highlight.js/lib/languages/python'
import 'highlight.js/styles/github.css'

hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('go', go)
hljs.registerLanguage('python', python)

interface CodeSamplesProps {
  initialLanguage?: 'typescript' | 'go' | 'python'
}

const codeExamples = {
  typescript: `import * as path from "node:path";
import { AwsStack } from 'terraconstructs/lib/aws';
import {
  NodejsFunction,
  destinations,
} from 'terraconstructs/lib/aws/compute';

export class ChainedLambdas extends AwsStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const mainFunction = new NodejsFunction(this, "Main", {
      path: path.join(
        __dirname,
        "my-function",
      ),
    });
    const successCb = new NodejsFunction(this, "Success", {
      path: path.join(
        __dirname,
        "on-success",
      ),
    });
    const errorCb = new NodejsFunction(this, "Error", {
      path: path.join(
        __dirname,
        "on-error",
      ),
    });

    mainFunction.configureAsyncInvoke({
      onSuccess: new destinations.FunctionDestination(successCb, {
        responseOnly: true,
      }),
      onFailure: new destinations.FunctionDestination(errorCb, {
        responseOnly: true,
      }),
      retryAttempts: 0,
    });
  }
}`,
  go: `package main
// work in progress

import (
	"path/filepath"

	"github.com/terraconstructs/aws"
	"github.com/terraconstructs/aws/compute"
)

type ChainedLambdas struct {
	*aws.AwsStack
}

func NewChainedLambdas(scope constructs.Construct, id string) *ChainedLambdas {
	stack := &ChainedLambdas{aws.NewAwsStack(scope, id)}

	mainFunction := compute.NewNodejsFunction(stack, "Main", &compute.NodejsFunctionConfig{
		Path: filepath.Join(".", "my-function"),
	})

	onSuccessCb := compute.NewNodejsFunction(stack, "Success", &compute.NodejsFunctionConfig{
		Path: filepath.Join(".", "on-success"),
	})

	onErrorCb := compute.NewNodejsFunction(stack, "Error", &compute.NodejsFunctionConfig{
		Path: filepath.Join(".", "on-error"),
	})

	mainFunction.ConfigureAsyncInvoke(&compute.AsyncInvokeConfig{
		OnSuccess: compute.NewFunctionDestination(onSuccessCb, &compute.FunctionDestinationConfig{
			ResponseOnly: true,
		}),
		OnFailure: compute.NewFunctionDestination(onErrorCb, &compute.FunctionDestinationConfig{
			ResponseOnly: true,
		}),
		RetryAttempts: 0,
	})

	return stack
}

func main() {
	app := cdktf.NewApp(nil)
	NewChainedLambdas(app, "chained-lambdas")
	app.Synth()
}`,
  python: `import os
# work in progress
from constructs import Construct
from terraconstructs.aws import AwsStack
from terraconstructs.aws.compute import NodejsFunction, destinations

class ChainedLambdas(AwsStack):
    def __init__(self, scope: Construct, id: str):
        super().__init__(scope, id)

        mainFunction = NodejsFunction(self, "Main",
            path=os.path.join(os.path.dirname(__file__), "my-function")
        )

        successCb = NodejsFunction(self, "Success",
            path=os.path.join(os.path.dirname(__file__), "on-success")
        )

        errorCb = NodejsFunction(self, "Error",
            path=os.path.join(os.path.dirname(__file__), "on-error")
        )

        mainFunction.configure_async_invoke(
            on_success=destinations.FunctionDestination(successCb, response_only=True),
            on_failure=destinations.FunctionDestination(errorCb, response_only=True),
            retry_attempts=0
        )

app = App()
ChainedLambdas(app, "chained-lambdas")
app.synth()`
}

export function CodeSamples({ initialLanguage = 'typescript' }: CodeSamplesProps) {
  const [language, setLanguage] = useState(initialLanguage)
  const [isCopied, setIsCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.innerHTML = hljs.highlight(codeExamples[language], { language }).value
    }
  }, [language])

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(codeExamples[language])
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="relative group w-full max-w-4xl mx-auto">
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="mb-4 flex justify-start space-x-2">
          <button
            onClick={() => setLanguage('typescript')}
            className={`px-3 py-1 rounded ${
              language === 'typescript' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            TypeScript
          </button>
          <button
            onClick={() => setLanguage('go')}
            className={`px-3 py-1 rounded ${
              language === 'go' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Go
          </button>
          <button
            onClick={() => setLanguage('python')}
            className={`px-3 py-1 rounded ${
              language === 'python' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Python
          </button>
        </div>
        <div className="relative">
          <pre className="max-w-full overflow-x-auto h-[600px] overflow-y-scroll custom-scrollbar">
            <code ref={codeRef} className={`language-${language} inline-block min-w-full`}></code>
          </pre>
          <button
            onClick={handleCopyClick}
            className="absolute top-2 right-4 p-2 bg-gray-300 rounded-md text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
            aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

