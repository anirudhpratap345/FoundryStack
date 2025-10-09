'use client';

import React, { useState } from 'react';
import { retrieverClient } from '@/lib/ai/retriever-client';
import { analystClient } from '@/lib/ai/analyst-client';
import { writerClient } from '@/lib/ai/writer-client';
import { reviewerClient } from '@/lib/ai/reviewer-client';
import { exporterClient } from '@/lib/ai/exporter-client';

interface TestResult {
  agent: string;
  status: 'pending' | 'running' | 'success' | 'error';
  processingTime: number;
  data?: any;
  error?: string;
}

export default function AgentPipelineTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testQuery, setTestQuery] = useState('AI-powered fintech startup for automated trading');
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  const resetTest = () => {
    setTestResults([]);
    setOverallStatus('idle');
  };

  const updateTestResult = (agent: string, status: TestResult['status'], data?: any, error?: string, processingTime: number = 0) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.agent === agent);
      if (existing) {
        return prev.map(r => r.agent === agent ? { ...r, status, data, error, processingTime } : r);
      } else {
        return [...prev, { agent, status, data, error, processingTime }];
      }
    });
  };

  const runCompletePipelineTest = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    resetTest();

    try {
      // Step 1: Retriever Agent
      updateTestResult('Retriever Agent', 'running');
      const retrieverStart = Date.now();
      const retrieverResult = await retrieverClient.enrichQuery(testQuery);
      const retrieverTime = Date.now() - retrieverStart;
      updateTestResult('Retriever Agent', 'success', retrieverResult, undefined, retrieverTime);

      // Step 2: Analyst Agent
      updateTestResult('Analyst Agent', 'running');
      const analystStart = Date.now();
      const analystResult = await analystClient.analyzeContext({
        idea: testQuery,
        context: retrieverResult.context,
        enriched_query: retrieverResult.enriched_query,
        confidence: retrieverResult.confidence
      });
      const analystTime = Date.now() - analystStart;
      updateTestResult('Analyst Agent', 'success', analystResult, undefined, analystTime);

      // Step 3: Writer Agent
      updateTestResult('Writer Agent', 'running');
      const writerStart = Date.now();
      const writerResult = await writerClient.generateContent({
        idea: testQuery,
        structured_analysis: analystResult.structured_analysis,
        user_context: { audience: 'founders', format: 'comprehensive' }
      });
      const writerTime = Date.now() - writerStart;
      updateTestResult('Writer Agent', 'success', writerResult, undefined, writerTime);

      // Step 4: Reviewer Agent
      updateTestResult('Reviewer Agent', 'running');
      const reviewerStart = Date.now();
      const reviewerResult = await reviewerClient.reviewBlueprint({
        writer_output: {
          founder_report: writerResult.founder_report,
          one_pager: writerResult.one_pager,
          pitch_ready: writerResult.pitch_ready,
          tweet: writerResult.tweet,
          processing_time: writerResult.processing_time,
          timestamp: writerResult.timestamp
        },
        original_query: testQuery,
        user_context: { audience: 'founders', quality_focus: 'high' }
      });
      const reviewerTime = Date.now() - reviewerStart;
      updateTestResult('Reviewer Agent', 'success', reviewerResult, undefined, reviewerTime);

      // Step 5: Exporter Agent
      updateTestResult('Exporter Agent', 'running');
      const exporterStart = Date.now();
      const exporterResult = await exporterClient.exportBlueprint({
        reviewed_blueprint: {
          reviewed_founder_report: reviewerResult.reviewed_founder_report,
          reviewed_one_pager: reviewerResult.reviewed_one_pager,
          reviewed_pitch_ready: reviewerResult.reviewed_pitch_ready,
          reviewed_tweet: reviewerResult.reviewed_tweet,
          issues_found: reviewerResult.issues_found,
          suggestions: reviewerResult.suggestions,
          overall_score: reviewerResult.overall_score,
          processing_time: reviewerResult.processing_time,
          timestamp: reviewerResult.timestamp
        },
        metadata: {
          user_id: 'test_user_123',
          blueprint_name: 'AI Fintech Trading Platform',
          blueprint_id: 'test_blueprint_456',
          export_formats: ['json', 'markdown', 'html'],
          include_metadata: true,
          include_issues: true,
          include_suggestions: true
        }
      });
      const exporterTime = Date.now() - exporterStart;
      updateTestResult('Exporter Agent', 'success', exporterResult, undefined, exporterTime);

      setOverallStatus('success');
    } catch (error) {
      console.error('Pipeline test failed:', error);
      setOverallStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'running': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="glass rounded-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-6">🧪 Multi-Agent Pipeline Test</h2>
        
        {/* Test Query Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Query
          </label>
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your startup idea to test..."
          />
        </div>

        {/* Test Controls */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={runCompletePipelineTest}
            disabled={isRunning}
            className={`px-6 py-2 rounded-md font-medium ${
              isRunning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? 'Running Test...' : 'Run Complete Pipeline Test'}
          </button>
          
          <button
            onClick={resetTest}
            disabled={isRunning}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium disabled:opacity-50"
          >
            Reset Test
          </button>
        </div>

        {/* Overall Status */}
        {overallStatus !== 'idle' && (
          <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {overallStatus === 'running' && '🔄'}
                {overallStatus === 'success' && '✅'}
                {overallStatus === 'error' && '❌'}
              </span>
              <span className="font-medium">
                {overallStatus === 'running' && 'Pipeline Running...'}
                {overallStatus === 'success' && 'Pipeline Completed Successfully!'}
                {overallStatus === 'error' && 'Pipeline Failed'}
              </span>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Test Results</h3>
            
            {testResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getStatusIcon(result.status)}</span>
                    <span className="font-medium text-gray-800">{result.agent}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${getStatusColor(result.status)}`}>
                      {result.status === 'running' && 'Running...'}
                      {result.status === 'success' && 'Success'}
                      {result.status === 'error' && 'Error'}
                      {result.status === 'pending' && 'Pending'}
                    </span>
                    {result.processingTime > 0 && (
                      <span className="text-sm text-gray-500">
                        {result.processingTime}ms
                      </span>
                    )}
                  </div>
                </div>
                
                {result.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {result.error}
                  </div>
                )}
                
                {result.data && result.status === 'success' && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                    <details>
                      <summary className="cursor-pointer font-medium">View Details</summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pipeline Flow Visualization */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline Flow</h3>
          <div className="flex items-center justify-between">
            {['Retriever', 'Analyst', 'Writer', 'Reviewer', 'Exporter'].map((agent, index) => (
              <div key={agent} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                  testResults.find(r => r.agent === `${agent} Agent`)?.status === 'success' ? 'bg-green-500' :
                  testResults.find(r => r.agent === `${agent} Agent`)?.status === 'running' ? 'bg-blue-500' :
                  testResults.find(r => r.agent === `${agent} Agent`)?.status === 'error' ? 'bg-red-500' :
                  'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs mt-1 text-gray-600">{agent}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
