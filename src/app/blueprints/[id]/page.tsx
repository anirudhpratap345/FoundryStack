"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Target, FileText, Clock, Github, Brain, Circle, Trash2, RefreshCw } from "lucide-react";
import { getBlueprint, regenerateBlueprint, exportBlueprint, exportBlueprintAsMarkdown, deleteBlueprint, Blueprint } from "@/lib/api/client";
import Link from "next/link";
import MarketAnalysisDisplay from "@/components/MarketAnalysisDisplay";
import TechnicalBlueprintDisplay from "@/components/TechnicalBlueprintDisplay";
import { BlueprintDetailSkeleton } from "@/components/LoadingSkeleton";

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
    if (!params.id || !blueprint) return;
    
    // Use the original idea/description as the prompt for regeneration
    const prompt = blueprint.description || `Create a comprehensive startup blueprint for: ${blueprint.title}`;
    
    setRegenerating(true);
    try {
      const updatedBlueprint = await regenerateBlueprint(params.id as string, prompt);
      setBlueprint(updatedBlueprint);
    } catch (error) {
      console.error('Failed to regenerate blueprint:', error);
      alert('Failed to regenerate blueprint. Please try again.');
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
        return 'bg-green-500/10 text-green-300 border border-green-500/20';
      case 'GENERATING':
        return 'bg-blue-500/10 text-blue-300 border border-blue-500/20';
      case 'ANALYZING':
        return 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20';
      case 'FAILED':
        return 'bg-red-500/10 text-red-300 border border-red-500/20';
      default:
        return 'bg-white/10 text-white border border-white/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-300 border border-red-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-300 border border-orange-500/20';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20';
      case 'LOW':
        return 'bg-green-500/10 text-green-300 border border-green-500/20';
      default:
        return 'bg-white/10 text-white border border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-28">
        <div className="absolute inset-0 animated-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50"></div>
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-white mb-3">Loading Blueprint</h1>
            <p className="text-gray-300 text-sm">Please wait while we load your blueprint...</p>
          </div>
          <BlueprintDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-28">
        <div className="absolute inset-0 animated-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50"></div>
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="glass rounded-2xl p-8 border border-red-500/20">
              <div className="text-red-400 text-5xl mb-3">⚠️</div>
              <h1 className="text-xl font-semibold text-white mb-3">Blueprint Not Found</h1>
              <p className="text-gray-300 mb-6">{error}</p>
              <p className="text-gray-400 text-xs mb-6">Redirecting to blueprints list in a few seconds...</p>
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
      <div className="min-h-screen relative overflow-hidden pt-28">
        <div className="absolute inset-0 animated-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50"></div>
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-3">Blueprint not found</h2>
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
    <div className="min-h-screen relative overflow-hidden pt-20">
      {/* Animated background */}
      <div className="absolute inset-0 animated-gradient opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50"></div>

      {/* Top utility row (back button beside navbar) */}
      <div className="fixed top-3 left-4 md:top-4 md:left-6 z-50">
        <Link href="/blueprints" aria-label="Back to blueprints">
          <Button
            title="Back to Blueprints"
            variant="outline"
            size="sm"
            className="rounded-full h-9 md:h-10 px-3 md:px-4 border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pt-4 pb-10">
        <div className="max-w-7xl mx-auto">
          {/* Blueprint Header */}
          <div className="mb-6">
            {/* Highlighted prompt box */}
            {blueprint.description && (
              <div className="glass-subtle border border-white/10 rounded-xl p-4 text-sm text-gray-300 max-w-3xl">
                {blueprint.description}
              </div>
            )}
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
                    <h3 className="text-lg font-semibold text-white">Generating Blueprint</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-300 text-sm">AI is analyzing your idea and generating comprehensive blueprint...</span>
                    </div>
                    <div className="text-xs text-gray-400">
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
              {blueprint.market_analysis && (
                <MarketAnalysisDisplay analysis={blueprint.market_analysis} />
              )}

              {/* Technical Blueprint */}
              {blueprint.technical_blueprint && (
                <TechnicalBlueprintDisplay blueprint={blueprint.technical_blueprint} />
              )}

              {/* Implementation Plan */}
              {blueprint.implementation_plan && (
                <div className="glass rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-800">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Implementation Plan ({blueprint.implementation_plan.totalWeeks} weeks)
                    </h3>
                  </div>
                  <div className="space-y-8">
                    {blueprint.implementation_plan.sprints.map((sprint: any, index: number) => (
                      <div key={index} className="border-l-4 border-purple-500/50 pl-6">
                        <h4 className="font-semibold text-white mb-2 text-sm">
                          Week {sprint.week}: {sprint.title}
                        </h4>
                        <p className="text-gray-300 mb-3 leading-relaxed text-sm">{sprint.description}</p>
                        <div className="space-y-3">
                          {sprint.tasks.map((task: any) => (
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
                <h3 className="text-base font-semibold text-white mb-3">Quick Actions</h3>
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium mb-4 ${getStatusColor(blueprint.status)}`}>
                  {blueprint.status}
                </div>
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
              {blueprint.code_templates && blueprint.code_templates.length > 0 && (
                <div id="code-templates" className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-900">
                      <Github className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Code Templates</h3>
                  </div>
                  <div className="space-y-4">
                    {blueprint.code_templates?.map((template: any, index: number) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="font-medium text-white mb-2 text-xs">{template.name}</h4>
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
