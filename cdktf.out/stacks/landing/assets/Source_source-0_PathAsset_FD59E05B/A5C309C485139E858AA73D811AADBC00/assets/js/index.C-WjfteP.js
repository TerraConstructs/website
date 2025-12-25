import{u as s,j as e}from"./blog.CHSDPaEs.js";const i=[{depth:2,value:"TerraConstructs Launch",id:"terraconstructs-launch"},{depth:2,value:"Public Speaking",id:"public-speaking",children:[{depth:3,value:"DevOps Days Singapore",id:"devops-days-singapore"},{depth:3,value:"Test Automation Summit - Singapore",id:"test-automation-summit---singapore"},{depth:3,value:"AWS Community Day Singapore",id:"aws-community-day-singapore"},{depth:3,value:"AWS Community Day Kuala Lumpur",id:"aws-community-day-kuala-lumpur"},{depth:3,value:"Brownbags",id:"brownbags"}]},{depth:2,value:"Workshops",id:"workshops",children:[{depth:3,value:"The AWS CDK Workshop in Terraform",id:"the-aws-cdk-workshop-in-terraform"}]},{depth:2,value:"Pod Casts",id:"pod-casts"},{depth:2,value:"Looking forward",id:"looking-forward"}],o={title:"2025 Year In Review",date:"2025-12-25",author:"Vincent De Smet",tags:["milestones","workshops"],excerpt:"As 2025 comes to an end, I pause to summarize the major TerraConstruct milestones of the year."},h={text:"6 min read",minutes:5.645,time:338700,words:1129};function t(n){const r={a:"a",blockquote:"blockquote",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",ul:"ul",...s(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(r.h2,{id:"terraconstructs-launch",children:e.jsx(r.a,{href:"#terraconstructs-launch",children:"TerraConstructs Launch"})}),`
`,e.jsx(r.p,{children:"TODO: Add milestones react component"}),`
`,e.jsxs(r.p,{children:["Q1 2025 launched ",e.jsx(r.a,{href:"https://web.archive.org/web/20250219185446/https://terraconstructs.dev/",children:"the first iteration"})," of the TerraConstructs website, and so much has happened since! The project continues to grow and gained it's first community contributions."]}),`
`,e.jsx(r.p,{children:"Having managed AWS Resources with raw Terraform since 2016, as well as explored popular tooling such as terragrunt for several large scale AWS based deployments, I am extremely excited to have the AWSCDK Developer Experience for myself and the product teams I work with cleanly living side-by-side with all existing Terraform automation, linting and collaboration set up."}),`
`,e.jsxs(r.p,{children:["Q3 2025 envisioned ",e.jsx(r.a,{href:"https://web.archive.org/web/20250917110535/https://terraconstructs.dev/",children:"the second iteration"})," with a much clearer project overview and mission statement. In this iteration I had my first taste of building more advanced UX with LLMs (mostly codex CLI at the time). As someone who hasn't done modern FrontEnd web development, being able to create the ",e.jsx(r.a,{href:"https://terraconstructs.dev/#demo",children:"live step-through"})," was very empowering!"]}),`
`,e.jsx(r.p,{children:"The main purpose of the Landing page as it stands is to provide a visual overview of what it feels like to define your infrastructure using this library of L2 Constructs as well as show how much actual Terraform configuration that takes care of!"}),`
`,e.jsx(r.h2,{id:"public-speaking",children:e.jsx(r.a,{href:"#public-speaking",children:"Public Speaking"})}),`
`,e.jsx(r.h3,{id:"devops-days-singapore",children:e.jsx(r.a,{href:"#devops-days-singapore",children:"DevOps Days Singapore"})}),`
`,e.jsxs(r.p,{children:["In May, ",e.jsx(r.a,{href:"https://www.macty.now/",children:"Charles Martinot"})," and I presented an LLM Driven workflow to automatically port AWSCDK L2 constructs on top of CDKTF at ",e.jsx(r.a,{href:"https://devopsdays.org/events/2025-singapore/program/bridging-aws-cdk-and-terraform/",children:"DevOps Days Singapore"}),". The presentation was divided into 2 parts:"]}),`
`,e.jsxs(r.ol,{children:[`
`,e.jsxs(r.li,{children:[`
`,e.jsx(r.p,{children:"Highlighting the importance of Higher Level programming languages in Infrastructure as Code."}),`
`,e.jsxs(r.p,{children:["In this part we wanted to showcase the difference in Developer Experience between classic Terraform Modules and the expressiveness and convenience of the powerful ",e.jsx(r.a,{href:"https://docs.aws.amazon.com/prescriptive-guidance/latest/aws-cdk-layers/layer-2.html",children:"L2 Constructs"})," within the AWSCDK library."]}),`
`]}),`
`,e.jsxs(r.li,{children:[`
`,e.jsx(r.p,{children:"Sharing the different steps involved in Retrieval Augmented Generation for porting those powerful AWSCDK L2 Constructs to CDKTF."}),`
`,e.jsx(r.p,{children:"In this part we broke down how we built a custom workflow to craft the LLM context and prompts using at that time State Of The Art LLMs such as Gemini 2.5 Pro (and its 1 Million Token context window)."}),`
`,e.jsx(r.p,{children:"This work involved:"}),`
`,e.jsxs(r.ol,{children:[`
`,e.jsxs(r.li,{children:["Initial Exploration of ",e.jsx(r.a,{href:"https://github.com/TerraConstructs/TerraTitan/tree/80c314baddfe3b51ed00733521595daf35c22338/data",children:"relevant reference data"})," and LLM Provider APIs such as ",e.jsx(r.a,{href:"https://github.com/TerraConstructs/TerraTitan/tree/80c314baddfe3b51ed00733521595daf35c22338/data/scripts/openai-cli",children:"OpenAI"}),", Anthropic and Google Gemini"]}),`
`,e.jsxs(r.li,{children:[e.jsx(r.a,{href:"https://github.com/TerraConstructs/TerraTitan/tree/80c314baddfe3b51ed00733521595daf35c22338/apps/core/src/mastra/rag",children:"Chunking strategies"})," for embedding and querying Terraform Provider AWS Resources using Vector stores"]}),`
`,e.jsxs(r.li,{children:["Human in the loop and Deterministic workflows built on top of ",e.jsx(r.a,{href:"https://mastra.ai",children:"Mastra AI"})]}),`
`,e.jsx(r.li,{children:"The role of Judges and Evals in validating the LLM Responses as well as preparing sample data sets and human judge benchmarks."}),`
`,e.jsx(r.li,{children:"Troubleshooting and Observability of LLM workflows using a local Signoz Stack."}),`
`]}),`
`,e.jsxs(r.p,{children:["The framework presented is available open source at ",e.jsx(r.a,{href:"https://github.com/terraconstructs/terratitan",children:"TerraTitan"})," and a crucial part in accelerating the development of the TerraConstructs library."]}),`
`]}),`
`]}),`
`,e.jsx(r.h3,{id:"test-automation-summit---singapore",children:e.jsx(r.a,{href:"#test-automation-summit---singapore",children:"Test Automation Summit - Singapore"})}),`
`,e.jsxs(r.p,{children:["Following DevOps Days, still in May, I also presented at ",e.jsx(r.a,{href:"https://www.testingmind.com/event/test-automation-summit-singapore-2025/",children:"Test Automation Summit - Singapore"})," to share ",e.jsx(r.a,{href:"https://gamma.app/docs/Evolving-IaC-Testing-From-Terraform-Basics-to-Terratest-and-Beyon-o969zcd4ejhfi8s?mode=doc",children:"a practical journey through infrastructure testing strategies"}),"."]}),`
`,e.jsx(r.p,{children:"This presentation focused on:"}),`
`,e.jsxs(r.ol,{children:[`
`,e.jsx(r.li,{children:"Introduction to the concepts of IaC / Terraform to an Audience focused on Test Automation"}),`
`,e.jsx(r.li,{children:"Introduction to the concept of Trunk Based development and feature flags applied to TF Modules"}),`
`,e.jsx(r.li,{children:"Overview of Terraform's innate Test commands"}),`
`,e.jsx(r.li,{children:"Overview and comparison to the TerraTest golang testing framework"}),`
`,e.jsx(r.li,{children:"Highlight of TerraConstructs usage of Snapshot and Unit Testing as made possible by tooling in the CDK Ecosystem"}),`
`]}),`
`,e.jsx(r.h3,{id:"aws-community-day-singapore",children:e.jsx(r.a,{href:"#aws-community-day-singapore",children:"AWS Community Day Singapore"})}),`
`,e.jsxs(r.p,{children:["In June, ",e.jsx(r.a,{href:"https://cv.skut.in/",children:"Maksim Skutin"})," and I presented at ",e.jsx(r.a,{href:"https://www.awsugsg.dev/",children:"AWS Community Day Singapore"}),' about "Next-Gen Infrastructure as Code: Scaling Smart with Pulumi & CDK". We shared how each of us approached Infrastructure as Code using higher level programming languages (Typescript, Golang, ...) and what the framework of our choice gave us.']}),`
`,e.jsx(r.p,{children:"Maksim shared how his team scaled Pulumi to manage thousands of resources with speed and compliance. I shared how we evolved a 3 year footprint of Terraform Modules and HCL into a higher level and product engineer friendly framework leveraging CDKTF and TerraConstructs."}),`
`,e.jsx(r.p,{children:"Both of us shared practical ways to transition our AWS IaC smoothly with lots of Day 2 tips and tricks."}),`
`,e.jsx(r.h3,{id:"aws-community-day-kuala-lumpur",children:e.jsx(r.a,{href:"#aws-community-day-kuala-lumpur",children:"AWS Community Day Kuala Lumpur"})}),`
`,e.jsxs(r.p,{children:["In September, ",e.jsx(r.a,{href:"https://www.linkedin.com/in/zhiyang-zack112",children:"Zack Hee"})," and I presented at ",e.jsx(r.a,{href:"https://awsug.my/acd-2025.html",children:"AWS Community Day Kuala Lumpur"})," a more deep dive on exactly how we at ",e.jsx(r.a,{href:"https://handshakes.ai",children:"handshakes.ai"})," leveraged CDKTF and TerraConstructs. This was an expanded presentation focused on:"]}),`
`,e.jsxs(r.ol,{children:[`
`,e.jsx(r.li,{children:"Why frameworks in the CDK Ecosystem make the most sense to use to manage IaC"}),`
`,e.jsx(r.li,{children:"Using the newly launched TerraConstructs website for a customized and live step through demo on what writing IaC using TerraConstructs looks like for a very visual insights into the benefits compared to the raw Terraform approached"}),`
`,e.jsxs(r.li,{children:["How we structure out ",e.jsx(r.code,{children:"git"})," repositories and AWS Environments to ensure our Product Engineers can use AWS as an extension of their workstation and iterate quickly on the configuration of their cloud resources"]}),`
`,e.jsx(r.li,{children:"How we promote features and fixes from dev, across staging to prod environments leveraging well understood and best in class software delivery mechanisms such as:"}),`
`,e.jsxs(r.li,{children:["Monorepo projects using ",e.jsx(r.a,{href:"https://pnpm.io/workspaces",children:"pnpm workspaces"})," and ",e.jsx(r.a,{href:"https://turborepo.com/",children:"TurboRepo"})]}),`
`,e.jsxs(r.li,{children:["NPMJS Private registry hosted in ",e.jsx(r.a,{href:"https://aws.amazon.com/codeartifact/",children:"AWS CodeArtifact"})]}),`
`,e.jsxs(r.li,{children:["Change and Release management using ",e.jsx(r.a,{href:"",children:"ChangeSets"})," for automated version bumping and Changelog generation."]}),`
`,e.jsxs(r.li,{children:["NPMJS Private registry hosted in ",e.jsx(r.a,{href:"https://aws.amazon.com/codeartifact/",children:"AWS CodeArtifact"})]}),`
`,e.jsxs(r.li,{children:[e.jsx(r.a,{href:"https://runatlantis.io",children:"Atlantis"})," with pre-workflow hooks to manage raw HCL and CDKTF side by side with Pull Request Automation."]}),`
`]}),`
`,e.jsx(r.h3,{id:"brownbags",children:e.jsx(r.a,{href:"#brownbags",children:"Brownbags"})}),`
`,e.jsx(r.p,{children:"Shorter sharing sessions at CodeLeap office and for the Vietnam Open Infra - HCMC community, re-iterated on the concepts of RAG and practical steps involved in building TerraTitan."}),`
`,e.jsxs(r.ul,{children:[`
`,e.jsxs(r.li,{children:["Vietnam Open Infra - ",e.jsx(r.a,{href:"https://gamma.app/docs/AI-Applied-Porting-IaC-libraries-with-RAG-9rof61grtigbgvl",children:"AI Applied: Porting (IaC) libraries with RAG"})]}),`
`,e.jsxs(r.li,{children:["Code Leap Brownbag - ",e.jsx(r.a,{href:"https://gamma.app/docs/AI-Applied-Porting-libraries-with-RAG-l4khbikxmv3phrx",children:"AI Applied: Porting libraries with RAG"})]}),`
`]}),`
`,e.jsx(r.h2,{id:"workshops",children:e.jsx(r.a,{href:"#workshops",children:"Workshops"})}),`
`,e.jsx(r.h3,{id:"the-aws-cdk-workshop-in-terraform",children:e.jsx(r.a,{href:"#the-aws-cdk-workshop-in-terraform",children:"The AWS CDK Workshop in Terraform"})}),`
`,e.jsxs(r.p,{children:["By July, I leveraged ",e.jsx(r.a,{href:"https://github.com/terraconstructs/terratitan",children:"TerraTitan"})," as well as spent a lot of time manually tuning Unit Tests and Integration Tests to ensure full coverage of AWS SNS, DynamoDb, Code Asset Bundling, ..."]}),`
`,e.jsxs(r.p,{children:["This culminated in the release of the ",e.jsx(r.a,{href:"https://aws-workshop.terraconstructs.dev",children:"TerraConstructs AWS CDK Workshop"}),". This workshop is the full original ",e.jsx(r.a,{href:"https://cdkworkshop.com",children:"CDK Workshop"}),". Fully working on top of Terraform provider AWS using CDKTF."]}),`
`,e.jsxs(r.p,{children:["I delivered this workshop internally at ",e.jsx(r.a,{href:"https://handshakes.ai",children:"handshakes.ai"})," and will be expanding more in 2026 as I take on a more prominent role maintaining and advocating for the CDKTF since ",e.jsx(r.a,{href:"https://terraconstructs.dev/blog/2025-12-12-cdktf-future",children:"Hashicorp/IBM Sunset"})," the project."]}),`
`,e.jsx(r.h2,{id:"pod-casts",children:e.jsx(r.a,{href:"#pod-casts",children:"Pod Casts"})}),`
`,e.jsxs(r.p,{children:["For the last few months of 2025, I have been catching up with ",e.jsx(r.a,{href:"https://www.linkedin.com/in/kaihendry/",children:"Kai Hendry"})," about events happening in the space of IaC and LLMs."]}),`
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
`,e.jsx(r.h2,{id:"looking-forward",children:e.jsx(r.a,{href:"#looking-forward",children:"Looking forward"})}),`
`,e.jsx(r.p,{children:"Going into 2026, a lot has changed, however my primary focus remains the same"}),`
`,e.jsxs(r.blockquote,{children:[`
`,e.jsx(r.p,{children:"Bringing a better Developer Experience for managing Infrastructure as code"}),`
`]}),`
`,e.jsx(r.p,{children:"My milestones to achieve this are:"}),`
`,e.jsxs(r.ol,{children:[`
`,e.jsx(r.li,{children:"As a core maintainer of Terraform for CDK: Update the CDKTF core from it's current Terraform 1.6 pin to the latest Terraform and OpenTofu versions"}),`
`,e.jsx(r.li,{children:"Quickly ramp up the AWSCDK coverage in TerraConstructs by updating TerraTitan with the latest advances in Agentic programming."}),`
`,e.jsx(r.li,{children:"TerraConstructs target other Terraform Providers to manage everything that currently falls outside of the AWSCDK tooling"}),`
`,e.jsx(r.li,{children:"Continue to run community workshops and share how to truly treat Infrastructure as Code (and not just config)."}),`
`]})]})}function d(n={}){const{wrapper:r}={...s(),...n.components};return r?e.jsx(r,{...n,children:e.jsx(t,{...n})}):t(n)}export{d as default,o as frontmatter,h as readingTime,i as toc};
//# sourceMappingURL=index.C-WjfteP.js.map
