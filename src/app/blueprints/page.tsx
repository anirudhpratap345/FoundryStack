"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Eye, Trash2, Calendar, Clock, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { getBlueprints, deleteBlueprint, Blueprint } from "@/lib/api/client";
import Link from "next/link";
import { BlueprintListSkeleton } from "@/components/LoadingSkeleton";

export default function BlueprintsPage() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const fetchBlueprints = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await getBlueprints();
      setBlueprints(result);
    } catch (error) {
      console.error('Failed to fetch blueprints:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteBlueprint = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(id);
    try {
      await deleteBlueprint(id);
      setBlueprints(blueprints.filter(bp => bp.id !== id));
    } catch (error) {
      console.error('Failed to delete blueprint:', error);
      alert('Failed to delete blueprint. Please try again.');
    } finally {
      setDeleting(null);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-[#0d1117]"></div>
        <div className="relative z-10 container mx-auto px-6 py-8">
          <div className="text-center mb-12">
            <h1 className="text-2xl font-semibold text-white mb-2">Your Blueprints</h1>
            <p className="text-gray-300 text-sm">AI-generated startup blueprints</p>
          </div>
          <BlueprintListSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-24">
      {/* Dark minimalist background */}
      <div className="absolute inset-0 bg-[#0d1117]"></div>
      
      {/* Header removed per request */}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-5 md:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">
              Your Blueprints
            </h2>
            <p className="text-sm text-gray-300">Manage and view your startup blueprints</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button 
              onClick={() => fetchBlueprints(true)}
              disabled={refreshing}
              variant="outline" 
              size="sm" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Link href="/">
              <Button className="flex items-center gap-3 h-10 sm:h-11 px-5 sm:px-6 btn-primary-light rounded-full">
                <Plus className="h-5 w-5 icon-shift" aria-hidden="true" />
                Create New Blueprint
              </Button>
            </Link>
          </div>
        </div>

        {blueprints.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center border border-white/10">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 w-fit mx-auto mb-6">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">
                     No blueprints yet
                   </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
                     Create your first blueprint to get started with transforming your startup idea into reality.
                   </p>
            <Link href="/">
              <Button className="flex items-center gap-3 h-11 px-7 btn-primary-light rounded-full">
                <Plus className="h-5 w-5" />
                Create Your First Blueprint
              </Button>
            </Link>
          </div>
        ) : (
           <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto place-items-stretch">
            {blueprints.map((blueprint) => (
              <div key={blueprint.id} className="hover-glow-border glass-strong card-ambient rounded-2xl p-6 md:p-7 border border-white/15 transition-all duration-300 group h-full flex flex-col focus-within:outline-none" tabIndex={0} aria-label={`Blueprint card for ${blueprint.title}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                             {blueprint.title}
                    </h3>
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(blueprint.status)}`}>
                      {blueprint.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 icon-shift" />}
                      {blueprint.status === 'ANALYZING' && <Clock className="h-3 w-3 icon-shift animate-pulse" />}
                      {blueprint.status === 'FAILED' && <AlertCircle className="h-3 w-3 icon-shift" />}
                      {blueprint.status}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed text-sm">
                  {blueprint.description}
                </p>
                
                <div className="space-y-2 text-xs md:text-sm text-gray-400 mb-5">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 icon-shift" />
                    Created {formatDate(blueprint.created_at)}
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 icon-shift" />
                    Updated {formatDate(blueprint.updated_at)}
                  </div>
                </div>

                <div className="mt-auto flex gap-2.5">
                  <Link href={`/blueprints/${blueprint.id}`} className="flex-1" aria-label={`View details for ${blueprint.title}`}>
                    <Button variant="outline" size="sm" className="w-full border-white/25 text-white/95 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 btn-outline-glow">
                      <Eye className="h-4 w-4 mr-2 icon-shift" />
                      View Details
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    aria-label={`Delete ${blueprint.title}`}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 focus-visible:ring-2 focus-visible:ring-red-400/40"
                    onClick={() => handleDeleteBlueprint(blueprint.id, blueprint.title)}
                    disabled={deleting === blueprint.id}
                  >
                    {deleting === blueprint.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 icon-shift" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
