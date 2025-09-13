"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2, Brain, Target, FileText, Clock, Github } from "lucide-react";
import { getBlueprintJob } from "@/lib/api/client";

interface BlueprintJob {
  id: string;
  blueprintId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  currentStep: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface BlueprintStatusProps {
  blueprintId: string;
  onComplete?: () => void;
}

const statusIcons = {
  PENDING: Loader2,
  PROCESSING: Brain,
  COMPLETED: CheckCircle,
  FAILED: AlertCircle
};

const statusColors = {
  PENDING: 'text-yellow-500',
  PROCESSING: 'text-blue-500',
  COMPLETED: 'text-green-500',
  FAILED: 'text-red-500'
};

const stepIcons = {
  'Initializing...': Brain,
  'Generating market analysis...': Target,
  'Generating technical blueprint...': FileText,
  'Generating implementation plan...': Clock,
  'Generating code templates...': Github,
  'Blueprint generation completed': CheckCircle
};

export default function BlueprintStatus({ blueprintId, onComplete }: BlueprintStatusProps) {
  const [job, setJob] = useState<BlueprintJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchJobStatus = async () => {
    try {
      const result = await getBlueprintJob(blueprintId);
      setJob(result);
      
      if (result?.status === 'COMPLETED' && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to fetch job status:', error);
    } finally {
      setLoading(false);
    }
  };

    fetchJobStatus();

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchJobStatus, 2000);

    return () => clearInterval(interval);
  }, [blueprintId, onComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-300">Loading status...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <p className="text-gray-300">No generation job found</p>
      </div>
    );
  }

  const StatusIcon = statusIcons[job.status];
  const StepIcon = stepIcons[job.currentStep as keyof typeof stepIcons] || Brain;

  return (
    <div className="glass rounded-2xl p-8 border border-white/10">
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          animate={job.status === 'PROCESSING' ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: job.status === 'PROCESSING' ? Infinity : 0, ease: "linear" }}
          className={`p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 ${statusColors[job.status]}`}
        >
          <StatusIcon className="h-6 w-6 text-white" />
        </motion.div>
        <div>
          <h3 className="text-xl font-semibold text-white">Blueprint Generation</h3>
          <p className="text-gray-400 text-sm">Status: {job.status}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Progress</span>
          <span className="text-sm text-gray-300">{job.progress}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${job.progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <StepIcon className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-medium text-white">Current Step</span>
        </div>
        <p className="text-gray-300 text-sm ml-8">{job.currentStep}</p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {job.error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Error</span>
            </div>
            <p className="text-sm text-red-300">{job.error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Steps */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white mb-3">Generation Steps</h4>
        {[
          { step: 'Initializing...', completed: job.progress > 0 },
          { step: 'Generating market analysis...', completed: job.progress > 20 },
          { step: 'Generating technical blueprint...', completed: job.progress > 40 },
          { step: 'Generating implementation plan...', completed: job.progress > 60 },
          { step: 'Generating code templates...', completed: job.progress > 80 },
          { step: 'Blueprint generation completed', completed: job.progress >= 100 }
        ].map((item, index) => {
          const isCurrentStep = job.currentStep === item.step;
          const isCompleted = item.completed;
          const Icon = stepIcons[item.step as keyof typeof stepIcons] || Brain;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isCurrentStep ? 'bg-blue-500/10 border border-blue-500/20' : 
                isCompleted ? 'bg-green-500/10 border border-green-500/20' : 
                'bg-white/5 border border-white/10'
              }`}
            >
              <div className={`p-1 rounded-full ${
                isCompleted ? 'bg-green-500' : 
                isCurrentStep ? 'bg-blue-500' : 
                'bg-gray-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-3 w-3 text-white" />
                ) : isCurrentStep ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-3 w-3 text-white" />
                  </motion.div>
                ) : (
                  <div className="h-3 w-3 rounded-full bg-white/50" />
                )}
              </div>
              <Icon className={`h-4 w-4 ${
                isCompleted ? 'text-green-400' : 
                isCurrentStep ? 'text-blue-400' : 
                'text-gray-400'
              }`} />
              <span className={`text-sm ${
                isCompleted ? 'text-green-300' : 
                isCurrentStep ? 'text-blue-300' : 
                'text-gray-400'
              }`}>
                {item.step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
