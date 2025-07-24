import { Cloud, Database, Server } from 'lucide-react'

const milestones = [
  {
    icon: Cloud,
    title: "Increase AWS Coverage",
    description: "Expand our AWS resource support to cover more services and use cases through the power of LLM Workflows and community support."
  },
  {
    icon: Database,
    title: "Add GCP Support",
    description: "Introduce Google Cloud Platform support, starting from 0% and building a comprehensive set of GCP constructs."
  },
  {
    icon: Server,
    title: "Add Azure Support",
    description: "Develop Azure constructs, bringing Microsoft's cloud platform into the TerraConstructs ecosystem."
  }
]

export function Roadmap() {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">Roadmap</h2>
      <div className="max-w-4xl mx-auto">
        {milestones.map((milestone, index) => (
          <div key={index} className="flex mb-8 last:mb-0">
            <div className="flex flex-col items-center mr-4">
              <div className="rounded-full bg-blue-500 p-2 text-white">
                <milestone.icon size={24} />
              </div>
              {index !== milestones.length - 1 && (
                <div className="h-full w-0.5 bg-blue-200 my-2"></div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
              <p className="text-gray-600">{milestone.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

