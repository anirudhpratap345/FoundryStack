import AgentPipelineTest from '@/components/AgentPipelineTest';

export default function TestPipelinePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            FoundryStack Multi-Agent System Test
          </h1>
          <p className="text-gray-600">
            Test the complete 5-agent pipeline from query to export
          </p>
        </div>
        
        <AgentPipelineTest />
      </div>
    </div>
  );
}
