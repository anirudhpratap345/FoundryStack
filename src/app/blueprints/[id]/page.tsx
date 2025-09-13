"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Target, FileText, Clock, Github, Brain, Circle, Trash2, RefreshCw } from "lucide-react";
import { getBlueprint, regenerateBlueprint, exportBlueprint, exportBlueprintAsMarkdown, deleteBlueprint } from "@/lib/api/client";
import Link from "next/link";
import MarketAnalysisDisplay from "@/components/MarketAnalysisDisplay";
import TechnicalBlueprintDisplay from "@/components/TechnicalBlueprintDisplay";
import { BlueprintDetailSkeleton } from "@/components/LoadingSkeleton";

interface Blueprint {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  marketAnalysis?: {
    targetMarket: string;
    competition: Array<{
      name: string;
      description: string;
      strengths: string[];
      weaknesses: string[];
    }>;
    positioning: string;
    revenueModel: string;
    marketSize: string;
  };
  technicalBlueprint?: {
    architecture: string;
    techStack: Array<{
      category: string;
      name: string;
      version?: string;
      rationale: string;
    }>;
    apiDesign: Array<{
      endpoint: string;
      method: string;
      description: string;
      requestSchema?: string;
      responseSchema?: string;
    }>;
    databaseSchema: string;
    deploymentStrategy: string;
  };
  implementationPlan?: {
    totalWeeks: number;
    sprints: Array<{
      week: number;
      title: string;
      description: string;
      tasks: Array<{
        id: string;
        title: string;
        description: string;
        estimatedHours: number;
        priority: string;
        dependencies: string[];
      }>;
      deliverables: string[];
    }>;
    milestones: Array<{
      week: number;
      title: string;
      description: string;
      criteria: string[];
    }>;
    deliverables: Array<{
      name: string;
      description: string;
      type: string;
      week: number;
    }>;
  };
  codeTemplates: Array<{
    name: string;
    description: string;
    language: string;
    framework?: string;
    repositoryUrl?: string;
    files: Array<{
      path: string;
      content: string;
      description: string;
    }>;
  }>;
}

export default function BlueprintDetailPage() {
  const params = useParams();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchBlueprint(params.id as string);
    }
  }, [params.id]);

  const fetchBlueprint = async (id: string) => {
    try {
      const result = await getBlueprint(id);
      setBlueprint(result);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch blueprint:', error);
      if (error instanceof Error) {
        setError(error.message);
        // If blueprint not found, redirect to blueprints list after a delay
        if (error.message.includes('not found')) {
          setTimeout(() => {
            window.location.href = '/blueprints';
          }, 3000);
        }
      }
    } finally {
      setLoading(false);
    }
  };


  const handleRegenerate = async () => {
    if (!params.id) return;
    
    setRegenerating(true);
    try {
      const updatedBlueprint = await regenerateBlueprint(params.id as string);
      setBlueprint(updatedBlueprint);
    } catch (error) {
      console.error('Failed to regenerate blueprint:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const handleExportJSON = () => {
    if (blueprint) {
      exportBlueprint(blueprint);
    }
  };

  const handleExportMarkdown = () => {
    if (blueprint) {
      exportBlueprintAsMarkdown(blueprint);
    }
  };

  const handleDeleteBlueprint = async () => {
    if (!blueprint) return;
    
    if (!confirm(`Are you sure you want to delete "${blueprint.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteBlueprint(blueprint.id);
      // Redirect to blueprints list after successful deletion
      window.location.href = '/blueprints';
    } catch (error) {
      console.error('Failed to delete blueprint:', error);
      alert('Failed to delete blueprint. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'GENERATING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ANALYZING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50"></div>
        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Loading Blueprint</h1>
            <p className="text-gray-300">Please wait while we load your blueprint...</p>
          </div>
          <BlueprintDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50"></div>
        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="glass rounded-2xl p-8 border border-red-500/20">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-white mb-4">Blueprint Not Found</h1>
              <p className="text-gray-300 mb-6">{error}</p>
              <p className="text-gray-400 text-sm mb-6">Redirecting to blueprints list in a few seconds...</p>
              <Link href="/blueprints" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Go to Blueprints
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50"></div>
        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Blueprint not found</h2>
            <Link href="/blueprints">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0">
                Back to Blueprints
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 animated-gradient opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50"></div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 glass">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/blueprints">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">FoundryStack</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(blueprint.status)}`}>
                {blueprint.status}
              </div>
              {blueprint.status === 'COMPLETED' && (
                <Button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {regenerating ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Regenerate
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
                           {/* Blueprint Header */}
                 <div className="mb-10">
                   <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                     {blueprint.title}
                   </h1>
                   <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">
                     {blueprint.description}
                   </p>
                 </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Blueprint Generation Status */}
              {blueprint.status === 'ANALYZING' && (
                <div className="glass rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                      <Brain className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Generating Blueprint</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-300">AI is analyzing your idea and generating comprehensive blueprint...</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      This may take 1-2 minutes. The page will update automatically when complete.
                    </div>
                  </div>
                </div>
              )}

              {blueprint.status === 'FAILED' && (
                <div className="glass rounded-2xl p-8 border border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-red-600">
                      <Circle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Generation Failed</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-300">The AI generation failed. This could be due to API limits or technical issues.</p>
                    <Button 
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {regenerating ? 'Retrying...' : 'Try Again'}
                    </Button>
                  </div>
                </div>
              )}
              {/* Market Analysis */}
              {blueprint.marketAnalysis && (
                <MarketAnalysisDisplay analysis={blueprint.marketAnalysis} />
              )}

              {/* Technical Blueprint */}
              {blueprint.technicalBlueprint && (
                <TechnicalBlueprintDisplay blueprint={blueprint.technicalBlueprint} />
              )}

              {/* Implementation Plan */}
              {blueprint.implementationPlan && (
                <div className="glass rounded-2xl p-8 border border-white/10">
                                           <div className="flex items-center gap-3 mb-4">
                           <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-800">
                             <Clock className="h-5 w-5 text-white" />
                           </div>
                           <h3 className="text-xl font-semibold text-white">
                             Implementation Plan ({blueprint.implementationPlan.totalWeeks} weeks)
                           </h3>
                         </div>
                  <div className="space-y-8">
                    {blueprint.implementationPlan.sprints.map((sprint, index) => (
                      <div key={index} className="border-l-4 border-purple-500/50 pl-6">
                        <h4 className="font-semibold text-white mb-2 text-base">
                          Week {sprint.week}: {sprint.title}
                        </h4>
                        <p className="text-gray-300 mb-3 leading-relaxed text-sm">{sprint.description}</p>
                        <div className="space-y-3">
                          {sprint.tasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10">
                              <Circle className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-white flex-1">{task.title}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">{task.estimatedHours}h</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
                                   <div className="glass rounded-2xl p-6 border border-white/10">
                       <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full h-12 border-white/20 text-white hover:bg-white/10" 
                    variant="outline"
                    onClick={() => {
                      const codeSection = document.getElementById('code-templates');
                      if (codeSection) {
                        codeSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <Github className="h-5 w-5 mr-3" />
                    View Code Templates
                  </Button>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full h-10 border-white/20 text-white hover:bg-white/10" 
                      variant="outline"
                      onClick={handleExportJSON}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                    <Button 
                      className="w-full h-10 border-white/20 text-white hover:bg-white/10" 
                      variant="outline"
                      onClick={handleExportMarkdown}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export Markdown
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full h-12 border-white/20 text-white hover:bg-white/10" 
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={regenerating}
                  >
                    <Brain className="h-5 w-5 mr-3" />
                    {regenerating ? 'Regenerating...' : 'Regenerate Analysis'}
                  </Button>
                  
                  <Button 
                    className="w-full h-12 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500" 
                    variant="outline"
                    onClick={handleDeleteBlueprint}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-5 w-5 mr-3" />
                        Delete Blueprint
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Code Templates */}
              {blueprint.codeTemplates && blueprint.codeTemplates.length > 0 && (
                <div id="code-templates" className="glass rounded-2xl p-6 border border-white/10">
                                           <div className="flex items-center gap-3 mb-4">
                           <div className="p-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-900">
                             <Github className="h-4 w-4 text-white" />
                           </div>
                           <h3 className="text-lg font-semibold text-white">Code Templates</h3>
                         </div>
                  <div className="space-y-4">
                    {blueprint.codeTemplates?.map((template, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="font-medium text-white mb-2 text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-300 mb-3 leading-relaxed">{template.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="bg-white/10 px-2 py-1 rounded-full">{template.language}</span>
                          {template.framework && <span className="bg-white/10 px-2 py-1 rounded-full">{template.framework}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
