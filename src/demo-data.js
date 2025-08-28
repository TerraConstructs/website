// Demo data for TerraConstructs examples
import workshopStackTs from '../demos/workshop/src/stack.ts?raw'
import workshopTerraform from '../demos/workshop/cdk.tf?raw'
import functionUrlStackTs from '../demos/function-url/src/stack.ts?raw'
import functionUrlTerraform from '../demos/function-url/cdk.tf?raw'

export const demoData = {
  workshop: {
    name: 'Workshop - Lambda + API Gateway',
    description: 'Basic Lambda function with API Gateway REST API',
    typescript: workshopStackTs,
    terraform: workshopTerraform,
    fileName: 'main.ts'
  },
  'function-url': {
    name: 'Function URL - Lambda with Function URL',
    description: 'Lambda function with direct HTTP endpoint using Function URL',
    typescript: functionUrlStackTs,
    terraform: functionUrlTerraform,
    fileName: 'main.ts'
  }
}

export function getDemoData(demoKey) {
  return demoData[demoKey] || demoData.workshop
}