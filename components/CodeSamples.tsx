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
  typescript: `import { Construct } from "constructs";
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

    // defines an API Gateway REST API resource backed by our "hello" function.
    new LambdaRestApi(this, "Endpoint", {
      cloudWatchRole: false,
      handler: hello,
      registerOutputs: true,
    });
  }
}`,
  go: `package main
// work in progress
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
  python: `# work in progress
from constructs import Construct
from terraconstructs import (
    aws,
)

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

