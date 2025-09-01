"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Plus, Eye, Trash2, Calendar, Clock } from "lucide-react";
import { graphqlRequest, QUERIES } from "@/lib/graphql/client";
import Link from "next/link";

interface Blueprint {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlueprintsPage() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const fetchBlueprints = async () => {
    try {
      const result = await graphqlRequest(QUERIES.GET_BLUEPRINTS);
      setBlueprints(result.blueprints);
    } catch (error) {
      console.error('Failed to fetch blueprints:', error);
    } finally {
      setLoading(false);
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
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50"></div>
        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading blueprints...</p>
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
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">FoundryStack</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  New Blueprint
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-12">
                           <div>
                   <h2 className="text-3xl font-bold text-white mb-3">
                     Your Blueprints
                   </h2>
                   <p className="text-lg text-gray-300">
                     Manage and view your startup blueprints
                   </p>
                 </div>
          <Link href="/">
            <Button className="flex items-center gap-3 h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 border-0 shadow-lg shadow-blue-500/25">
              <Plus className="h-5 w-5" />
              Create New Blueprint
            </Button>
          </Link>
        </div>

        {blueprints.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center border border-white/10">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 w-fit mx-auto mb-6">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
                               <h3 className="text-xl font-semibold text-white mb-4">
                     No blueprints yet
                   </h3>
                   <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
                     Create your first blueprint to get started with transforming your startup idea into reality.
                   </p>
            <Link href="/">
              <Button className="flex items-center gap-3 h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 border-0 shadow-lg shadow-blue-500/25">
                <Plus className="h-5 w-5" />
                Create Your First Blueprint
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blueprints.map((blueprint) => (
              <div key={blueprint.id} className="glass rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                                           <div className="flex-1">
                           <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
                             {blueprint.title}
                           </h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(blueprint.status)}`}>
                      {blueprint.status}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-400 mb-6 line-clamp-3 leading-relaxed text-sm">
                  {blueprint.description}
                </p>
                
                <div className="space-y-3 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" />
                    Created {formatDate(blueprint.createdAt)}
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    Updated {formatDate(blueprint.updatedAt)}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href={`/blueprints/${blueprint.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <Trash2 className="h-4 w-4" />
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
