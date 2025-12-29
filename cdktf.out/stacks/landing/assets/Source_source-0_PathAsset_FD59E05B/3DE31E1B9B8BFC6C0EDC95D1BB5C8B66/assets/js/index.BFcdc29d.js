import{u as h,j as e}from"./blog.DG4NK_Vy.js";const l=[{depth:2,value:"TerraConstructs Milestones",id:"terraconstructs-milestones"},{depth:2,value:"Public Speaking",id:"public-speaking",children:[{depth:3,value:"DevOps Days Singapore",id:"devops-days-singapore"},{depth:3,value:"Test Automation Summit - Singapore",id:"test-automation-summit---singapore"},{depth:3,value:"AWS Community Day Singapore",id:"aws-community-day-singapore"},{depth:3,value:"AWS Community Day Kuala Lumpur",id:"aws-community-day-kuala-lumpur"},{depth:3,value:"Brownbags",id:"brownbags"}]},{depth:2,value:"Workshops",id:"workshops",children:[{depth:3,value:"The AWS CDK Workshop in Terraform",id:"the-aws-cdk-workshop-in-terraform"}]},{depth:2,value:"Podcasts",id:"podcasts"},{depth:2,value:"Looking Forward",id:"looking-forward"}],c={title:"2025 Year In Review",date:"2025-12-25",author:"Vincent De Smet",tags:["milestones","workshops"],audio:{enabled:!0},excerpt:"As 2025 comes to an end, I pause to summarize the major TerraConstruct milestones of the year."},p={text:"6 min read",minutes:5.435,time:326100,words:1087};function o(t){const r={a:"a",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...h(),...t.components},{Callout:s,Milestones:i,Stats:a}=r;return s||n("Callout"),i||n("Milestones"),a||n("Stats"),e.jsxs(e.Fragment,{children:[e.jsx(a,{items:[{value:"4",label:"Conference Talks",icon:"mic"},{value:"12+",label:"Podcast Episodes",icon:"video"},{value:"1",label:"Workshop Released",icon:"book"}]}),`
`,e.jsx(r.h2,{id:"terraconstructs-milestones",children:e.jsx(r.a,{href:"#terraconstructs-milestones",children:"TerraConstructs Milestones"})}),`
`,e.jsxs(r.p,{children:["At the start of 2025, I launched ",e.jsx(r.a,{href:"https://web.archive.org/web/20250219185446/https://terraconstructs.dev/",children:"the first iteration"})," of the TerraConstructs website, and so much has happened since! The project continues to grow and gained its first community contributions."]}),`
`,e.jsx(i,{items:[{date:"January 2025",title:"Website Launch",description:"First iteration of TerraConstructs website goes live.",icon:"launch",link:{url:"https://web.archive.org/web/20250219185446/https://terraconstructs.dev/",label:"View archived version"}},{date:"July 2025",title:"AWS CDK Workshop",description:"Released the TerraConstructs AWS CDK Workshop - the full original CDK Workshop running on Terraform.",icon:"feature",link:{url:"https://aws-workshop.terraconstructs.dev",label:"Start the workshop"}},{date:"August 2025",title:"Website Redesign",description:"Second iteration with clearer project overview, mission statement, and the interactive live step-through demo.",icon:"update",link:{url:"https://web.archive.org/web/20250917110535/https://terraconstructs.dev/",label:"View archived version"}}]}),`
`,e.jsx(r.p,{children:"Having managed AWS resources with raw Terraform since 2016 and explored popular tooling such as Terragrunt for several large-scale AWS deployments, I am excited to have the AWS CDK developer experience for myself and the product teams I work with, living cleanly side-by-side with all existing Terraform automation, linting, and collaboration setups."}),`
`,e.jsxs(r.p,{children:["For ",e.jsx(r.a,{href:"https://web.archive.org/web/20250917110535/https://terraconstructs.dev/",children:"the second iteration"}),", I incorporated feedback and focused on a much clearer project overview and mission statement. This iteration gave me my first taste of building more advanced UX with LLMs (mostly Codex CLI at the time). As someone who hasn't done modern frontend web development, being able to create the ",e.jsx(r.a,{href:"https://terraconstructs.dev/#demo",children:"live step-through"})," was very empowering!"]}),`
`,e.jsx(r.p,{children:"The main purpose of the landing page is to provide a visual overview of what it feels like to define your infrastructure using this library of L2 Constructs, as well as to show how much Terraform configuration it handles for you!"}),`
`,e.jsx(r.h2,{id:"public-speaking",children:e.jsx(r.a,{href:"#public-speaking",children:"Public Speaking"})}),`
`,e.jsx(r.h3,{id:"devops-days-singapore",children:e.jsx(r.a,{href:"#devops-days-singapore",children:"DevOps Days Singapore"})}),`
`,e.jsxs(r.p,{children:["In May, ",e.jsx(r.a,{href:"https://www.macty.now/",children:"Charles Martinot"})," and I presented an LLM-driven workflow to automatically port AWS CDK L2 constructs on top of CDKTF at ",e.jsx(r.a,{href:"https://devopsdays.org/events/2025-singapore/program/bridging-aws-cdk-and-terraform/",children:"DevOps Days Singapore"}),". The presentation was divided into two parts:"]}),`
`,e.jsxs(r.ol,{children:[`
`,e.jsxs(r.li,{children:[`
`,e.jsx(r.p,{children:"Highlighting the importance of higher-level programming languages in Infrastructure as Code."}),`
`,e.jsxs(r.p,{children:["In this part, we wanted to showcase the difference in developer experience between classic Terraform modules and the expressiveness and convenience of the powerful ",e.jsx(r.a,{href:"https://docs.aws.amazon.com/prescriptive-guidance/latest/aws-cdk-layers/layer-2.html",children:"L2 Constructs"})," within the AWS CDK library."]}),`
`]}),`
`,e.jsxs(r.li,{children:[`
`,e.jsx(r.p,{children:"Sharing the different steps involved in Retrieval-Augmented Generation for porting those powerful AWS CDK L2 Constructs to CDKTF."}),`
`,e.jsx(r.p,{children:"In this part, we broke down how we built a custom workflow to craft the LLM context and prompts using what were then state-of-the-art LLMs such as Gemini 2.5 Pro (and its 1 million token context window)."}),`
`,e.jsx(r.p,{children:"This work involved:"}),`
`,e.jsxs(r.ol,{children:[`
`,e.jsxs(r.li,{children:["Initial exploration of ",e.jsx(r.a,{href:"https://github.com/TerraConstructs/TerraTitan/tree/80c314baddfe3b51ed00733521595daf35c22338/data",children:"relevant reference data"})," and LLM provider APIs such as ",e.jsx(r.a,{href:"https://github.com/TerraConstructs/TerraTitan/tree/80c314baddfe3b51ed00733521595daf35c22338/data/scripts/openai-cli",children:"OpenAI"}),", Anthropic, and Google Gemini"]}),`
`,e.jsxs(r.li,{children:[e.jsx(r.a,{href:"https://github.com/TerraConstructs/TerraTitan/tree/80c314baddfe3b51ed00733521595daf35c22338/apps/core/src/mastra/rag",children:"Chunking strategies"})," for embedding and querying Terraform Provider AWS resources using vector stores"]}),`
`,e.jsxs(r.li,{children:["Human-in-the-loop and deterministic workflows built on top of ",e.jsx(r.a,{href:"https://mastra.ai",children:"Mastra AI"})]}),`
`,e.jsx(r.li,{children:"The role of judges and evals in validating LLM responses as well as preparing sample datasets and human judge benchmarks"}),`
`,e.jsx(r.li,{children:"Troubleshooting and observability of LLM workflows using a local SigNoz stack"}),`
`]}),`
`,e.jsxs(r.p,{children:["The framework presented is available as open source at ",e.jsx(r.a,{href:"https://github.com/terraconstructs/terratitan",children:"TerraTitan"})," and is a crucial part of accelerating the development of the TerraConstructs library."]}),`
`]}),`
`]}),`
`,e.jsx(r.h3,{id:"test-automation-summit---singapore",children:e.jsx(r.a,{href:"#test-automation-summit---singapore",children:"Test Automation Summit - Singapore"})}),`
`,e.jsxs(r.p,{children:["Following DevOps Days, still in May, I also presented at ",e.jsx(r.a,{href:"https://www.testingmind.com/event/test-automation-summit-singapore-2025/",children:"Test Automation Summit - Singapore"})," to share ",e.jsx(r.a,{href:"https://gamma.app/docs/Evolving-IaC-Testing-From-Terraform-Basics-to-Terratest-and-Beyon-o969zcd4ejhfi8s?mode=doc",children:"a practical journey through infrastructure testing strategies"}),"."]}),`
`,e.jsx(r.p,{children:"This presentation focused on:"}),`
`,e.jsxs(r.ol,{children:[`
`,e.jsx(r.li,{children:"Introduction to the concepts of IaC and Terraform for an audience focused on test automation"}),`
`,e.jsx(r.li,{children:"Introduction to the concept of trunk-based development and feature flags applied to Terraform modules"}),`
`,e.jsx(r.li,{children:"Overview of Terraform's built-in test commands"}),`
`,e.jsx(r.li,{children:"Overview and comparison of the Terratest Go testing framework"}),`
`,e.jsx(r.li,{children:"Highlight of TerraConstructs' usage of snapshot and unit testing as made possible by tooling in the CDK ecosystem"}),`
`]}),`
`,e.jsx(r.h3,{id:"aws-community-day-singapore",children:e.jsx(r.a,{href:"#aws-community-day-singapore",children:"AWS Community Day Singapore"})}),`
`,e.jsxs(r.p,{children:["In June, ",e.jsx(r.a,{href:"https://cv.skut.in/",children:"Maksim Skutin"})," and I presented at ",e.jsx(r.a,{href:"https://www.awsugsg.dev/",children:"AWS Community Day Singapore"}),' about "Next-Gen Infrastructure as Code: Scaling Smart with Pulumi & CDK". We shared how each of us approached Infrastructure as Code using higher-level programming languages (TypeScript, Go, etc.) and what our framework of choice gave us.']}),`
`,e.jsx(r.p,{children:"Maksim shared how his team scaled Pulumi to manage thousands of resources with speed and compliance. I shared how we evolved a 3-year footprint of Terraform modules and HCL into a higher-level, product-engineer-friendly framework leveraging CDKTF and TerraConstructs."}),`
`,e.jsx(r.p,{children:"Both of us shared practical ways to transition AWS IaC smoothly, along with plenty of Day 2 tips and tricks."}),`
`,e.jsx(r.h3,{id:"aws-community-day-kuala-lumpur",children:e.jsx(r.a,{href:"#aws-community-day-kuala-lumpur",children:"AWS Community Day Kuala Lumpur"})}),`
`,e.jsxs(r.p,{children:["In September, ",e.jsx(r.a,{href:"https://www.linkedin.com/in/zhiyang-zack112",children:"Zack Hee"})," and I presented at ",e.jsx(r.a,{href:"https://awsug.my/acd-2025.html",children:"AWS Community Day Kuala Lumpur"})," with a deeper dive on exactly how we at ",e.jsx(r.a,{href:"https://handshakes.ai",children:"handshakes.ai"})," leveraged CDKTF and TerraConstructs. This expanded presentation focused on:"]}),`
`,e.jsxs(r.ol,{children:[`
`,e.jsx(r.li,{children:"Why frameworks in the CDK ecosystem make the most sense for managing IaC"}),`
`,e.jsx(r.li,{children:"Using the newly launched TerraConstructs website for a customized, live step-through demo showing what writing IaC using TerraConstructs looks like, providing visual insight into the benefits compared to raw Terraform"}),`
`,e.jsx(r.li,{children:"How we structure our Git repositories and AWS environments to ensure our product engineers can use AWS as an extension of their workstation and iterate quickly on cloud resource configuration"}),`
`,e.jsxs(r.li,{children:["How we promote features and fixes from dev, across staging, to prod environments leveraging well-understood, best-in-class software delivery mechanisms such as:",`
`,e.jsxs(r.ol,{children:[`
`,e.jsxs(r.li,{children:["Monorepo projects using ",e.jsx(r.a,{href:"https://pnpm.io/workspaces",children:"pnpm workspaces"})," and ",e.jsx(r.a,{href:"https://turborepo.com/",children:"TurboRepo"})]}),`
`,e.jsxs(r.li,{children:["Private npm registry hosted in ",e.jsx(r.a,{href:"https://aws.amazon.com/codeartifact/",children:"AWS CodeArtifact"})]}),`
`,e.jsxs(r.li,{children:["Change and release management using ",e.jsx(r.a,{href:"https://github.com/changesets/changesets",children:"Changesets"})," for automated version bumping and changelog generation"]}),`
`,e.jsxs(r.li,{children:[e.jsx(r.a,{href:"https://runatlantis.io",children:"Atlantis"})," with pre-workflow hooks to manage raw HCL and CDKTF side by side with pull request automation"]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(r.h3,{id:"brownbags",children:e.jsx(r.a,{href:"#brownbags",children:"Brownbags"})}),`
`,e.jsx(r.p,{children:"Shorter sharing sessions at the CodeLeap office and for the Vietnam Open Infra - HCMC community reiterated on the concepts of RAG and the practical steps involved in building TerraTitan."}),`
`,e.jsxs(r.ul,{children:[`
`,e.jsxs(r.li,{children:["Vietnam Open Infra - ",e.jsx(r.a,{href:"https://gamma.app/docs/AI-Applied-Porting-IaC-libraries-with-RAG-9rof61grtigbgvl",children:"AI Applied: Porting (IaC) libraries with RAG"})]}),`
`,e.jsxs(r.li,{children:["Code Leap Brownbag - ",e.jsx(r.a,{href:"https://gamma.app/docs/AI-Applied-Porting-libraries-with-RAG-l4khbikxmv3phrx",children:"AI Applied: Porting libraries with RAG"})]}),`
`]}),`
`,e.jsx(r.h2,{id:"workshops",children:e.jsx(r.a,{href:"#workshops",children:"Workshops"})}),`
`,e.jsx(r.h3,{id:"the-aws-cdk-workshop-in-terraform",children:e.jsx(r.a,{href:"#the-aws-cdk-workshop-in-terraform",children:"The AWS CDK Workshop in Terraform"})}),`
`,e.jsxs(r.p,{children:["By July, I had leveraged ",e.jsx(r.a,{href:"https://github.com/terraconstructs/terratitan",children:"TerraTitan"})," and spent considerable time manually tuning unit tests and integration tests to ensure full coverage of AWS SNS, DynamoDB, code asset bundling, and more."]}),`
`,e.jsxs(r.p,{children:["This culminated in the release of the ",e.jsx(r.a,{href:"https://aws-workshop.terraconstructs.dev",children:"TerraConstructs AWS CDK Workshop"}),". This workshop is the full original ",e.jsx(r.a,{href:"https://cdkworkshop.com",children:"CDK Workshop"}),", fully working on top of Terraform Provider AWS using CDKTF."]}),`
`,e.jsxs(r.p,{children:["I delivered this workshop internally at ",e.jsx(r.a,{href:"https://handshakes.ai",children:"handshakes.ai"})," and will be expanding it further in 2026 as I take on a more prominent role maintaining and advocating for CDKTF since ",e.jsx(r.a,{href:"https://terraconstructs.dev/blog/2025-12-12-cdktf-future",children:"HashiCorp/IBM sunset"})," the project."]}),`
`,e.jsx(r.h2,{id:"podcasts",children:e.jsx(r.a,{href:"#podcasts",children:"Podcasts"})}),`
`,e.jsxs(r.p,{children:["For the last few months of 2025, I have been catching up with ",e.jsx(r.a,{href:"https://www.linkedin.com/in/kaihendry/",children:"Kai Hendry"})," to discuss events happening in the IaC and LLM space."]}),`
`,e.jsxs(r.ul,{children:[`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/UXIJe2moZ-I",children:"Terralith: the Future of Terraform Automation and Collaboration?"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/q2KOAAtT-Qw",children:"What is Spec-Driven Development"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/gkoxHncYCTk",children:"Infrastructure as Code & Platform teams"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/OacVAuGFSHg",children:"Who is Vincent De Smet & What is the Grid"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/z6V8fgm7xYY",children:"Trunk based infrastructure with feature flags"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/54Z4HlO_sW8",children:"AI for Infrastructure Engineers"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/lst5spLZo-U",children:"AI Acceleration with Anthropic and Beads"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/I4pmTz8EKag",children:"AI Infrastructure addicts"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/eSEg3wKBs-8",children:"Adopting AI with steveyegge/beads"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/yokbTRUvxQU",children:"Beads, SpecKit, Perles, Opus, Agents, oh my!"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/rM2pj0JKc0g",children:"CDK for Terraform and two pizza teams"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/NfzsrgTmBtY",children:"Why do we need the Cloud Development Kit?"})}),`
`,e.jsx(r.li,{children:e.jsx(r.a,{href:"https://youtu.be/gvgK2wp_-UQ",children:"SpecKit vs Conductor, Kiro Next?"})}),`
`]}),`
`,e.jsx(r.h2,{id:"looking-forward",children:e.jsx(r.a,{href:"#looking-forward",children:"Looking Forward"})}),`
`,e.jsx(r.p,{children:"Going into 2026, a lot has changed; however, my primary focus remains the same:"}),`
`,e.jsx(s,{type:"tip",title:"Mission",children:e.jsx(r.p,{children:"Bringing a better developer experience for managing Infrastructure as Code"})}),`
`,e.jsx(r.p,{children:"My milestones to achieve this are:"}),`
`,e.jsxs(r.ol,{children:[`
`,e.jsx(r.li,{children:"As a core maintainer of CDK for Terraform: update the CDKTF core from its current Terraform 1.6 pin to the latest Terraform and OpenTofu versions"}),`
`,e.jsx(r.li,{children:"Quickly ramp up AWS CDK coverage in TerraConstructs by updating TerraTitan with the latest advances in agentic programming"}),`
`,e.jsx(r.li,{children:"Have TerraConstructs target other Terraform providers to manage everything that currently falls outside of AWS CDK tooling"}),`
`,e.jsxs(r.li,{children:["Continue to run community workshops and share how to truly treat Infrastructure as ",e.jsx(r.strong,{children:"Code"})," (and not just config)"]}),`
`]})]})}function u(t={}){const{wrapper:r}={...h(),...t.components};return r?e.jsx(r,{...t,children:e.jsx(o,{...t})}):o(t)}function n(t,r){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}export{u as default,c as frontmatter,p as readingTime,l as toc};
//# sourceMappingURL=index.BFcdc29d.js.map
