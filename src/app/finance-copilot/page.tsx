'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import FinanceInputForm from '@/components/FinanceInputForm';
import FinanceStrategyResults from '@/components/FinanceStrategyResults';
import type { StartupInputs, FundingStrategy } from '@/types/finance-copilot';

export default function FinanceCopilotPage() {
  const [strategy, setStrategy] = useState<FundingStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (inputs: StartupInputs) => {
    setIsLoading(true);
    setError(null);
    setStrategy(null);

    try {
      console.log('🚀 Submitting finance strategy request...');
      
      const response = await fetch('/api/finance-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate strategy');
      }

      const data = await response.json();
      console.log('✅ Strategy received:', data);

      if (data.success && data.strategy) {
        setStrategy(data.strategy);
        // Scroll to results
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error(data.error || 'No strategy generated');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStrategy(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-[#0d1117] to-black pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI Finance Copilot
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Get personalized funding recommendations powered by AI. 
              Answer a few questions about your startup and receive a complete financial strategy.
            </p>
          </motion.div>

          {/* Input Form */}
          {!strategy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FinanceInputForm onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-strong rounded-xl p-6 border border-red-500/20 bg-red-500/5 mb-8"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">
                    Generation Failed
                  </h3>
                  <p className="text-sm text-white/80 mb-4">{error}</p>
                  <button
                    onClick={handleReset}
                    className="text-sm text-white/60 hover:text-white transition-colors underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-strong rounded-xl p-12 border border-white/10 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-6">
                <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Generating Your Strategy...
              </h3>
              <p className="text-sm text-white/60 mb-4">
                Our AI agents are analyzing your startup and crafting a personalized funding strategy.
              </p>
              <div className="max-w-md mx-auto space-y-2 text-xs text-white/40">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Analyzing funding stage...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse animation-delay-200" />
                  <span>Calculating raise amount...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse animation-delay-400" />
                  <span>Matching investor types...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {strategy && !isLoading && (
            <div id="results">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Your Strategy</h2>
                <button
                  onClick={handleReset}
                  className="text-sm px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Generate New Strategy
                </button>
              </div>
              <FinanceStrategyResults strategy={strategy} />
            </div>
          )}

          {/* Info Footer */}
          {!strategy && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                Powered by Gemini 2.0 AI • 6 Specialized Agents
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

