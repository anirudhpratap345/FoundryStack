"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Zap, Target, Clock, FileText, Github, Database, Brain, Play, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { createBlueprint } from "@/lib/api/client";
import AnimatedBackground from "@/components/AnimatedBackground";
import GlassCard from "@/components/GlassCard";
import AnimatedButton from "@/components/AnimatedButton";
import { validateBlueprintIdea, validateBlueprintTitle } from "@/lib/validation";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const generateTitle = (idea: string): string => {
    // Extract key concepts from the idea
    const ideaLower = idea.toLowerCase();
    
    // Common patterns to extract better titles
    if (ideaLower.includes('ai') && ideaLower.includes('fintech')) {
      return 'AI Fintech Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('healthcare')) {
      return 'AI Healthcare Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('ecommerce')) {
      return 'AI E-commerce Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('education')) {
      return 'AI Education Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('logistics')) {
      return 'AI Logistics Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('real estate')) {
      return 'AI Real Estate Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('agriculture')) {
      return 'AI Agriculture Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('energy')) {
      return 'AI Energy Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('transportation')) {
      return 'AI Transportation Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('entertainment')) {
      return 'AI Entertainment Blueprint';
    }
    
    // Generic AI patterns
    if (ideaLower.includes('ai') && ideaLower.includes('startup')) {
      return 'AI Startup Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('platform')) {
      return 'AI Platform Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('app')) {
      return 'AI App Blueprint';
    }
    if (ideaLower.includes('ai') && ideaLower.includes('saas')) {
      return 'AI SaaS Blueprint';
    }
    
    // Fintech patterns
    if (ideaLower.includes('fintech') && ideaLower.includes('startup')) {
      return 'Fintech Startup Blueprint';
    }
    if (ideaLower.includes('fintech') && ideaLower.includes('platform')) {
      return 'Fintech Platform Blueprint';
    }
    if (ideaLower.includes('fintech') && ideaLower.includes('app')) {
      return 'Fintech App Blueprint';
    }
    
    // E-commerce patterns
    if (ideaLower.includes('ecommerce') && ideaLower.includes('startup')) {
      return 'E-commerce Startup Blueprint';
    }
    if (ideaLower.includes('ecommerce') && ideaLower.includes('platform')) {
      return 'E-commerce Platform Blueprint';
    }
    
    // Healthcare patterns
    if (ideaLower.includes('healthcare') && ideaLower.includes('startup')) {
      return 'Healthcare Startup Blueprint';
    }
    if (ideaLower.includes('healthcare') && ideaLower.includes('platform')) {
      return 'Healthcare Platform Blueprint';
    }
    
    // Education patterns
    if (ideaLower.includes('education') && ideaLower.includes('startup')) {
      return 'EdTech Startup Blueprint';
    }
    if (ideaLower.includes('education') && ideaLower.includes('platform')) {
      return 'EdTech Platform Blueprint';
    }
    
    // Generic patterns
    if (ideaLower.includes('startup')) {
      return 'Startup Blueprint';
    }
    if (ideaLower.includes('platform')) {
      return 'Platform Blueprint';
    }
    if (ideaLower.includes('app')) {
      return 'App Blueprint';
    }
    if (ideaLower.includes('saas')) {
      return 'SaaS Blueprint';
    }
    
    // Fallback: clean up the first line
    const firstLine = idea.split('\n')[0].trim();
    if (firstLine.length > 50) {
      return firstLine.substring(0, 50) + '... Blueprint';
    }
    return firstLine + ' Blueprint';
  };

  const handleGenerateBlueprint = async () => {
    // Clear previous errors
    setError("");
    setValidationErrors([]);
    setSuccess("");
    
    // Validate input
    const ideaValidation = validateBlueprintIdea(idea);
    if (!ideaValidation.isValid) {
      setValidationErrors(ideaValidation.errors.map(e => e.message));
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await createBlueprint({
        title: generateTitle(idea),
        description: idea,
        idea: idea
      });
      
      console.log('Blueprint created:', result);
      setSuccess("Blueprint created successfully! Redirecting...");
      
      // Redirect to blueprints page after a short delay
      setTimeout(() => {
        window.location.href = '/blueprints';
      }, 1500);
    } catch (error: any) {
      console.error('Failed to create blueprint:', error);
      
      // Handle different error types
      if (error.message?.includes('Rate limit')) {
        setError("You're creating blueprints too quickly. Please wait a moment and try again.");
      } else if (error.message?.includes('Validation failed')) {
        setError("Please check your input and try again.");
      } else {
        setError("Failed to create blueprint. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 border-b border-white/10 glass-subtle"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 glow-blue"
              >
                <Sparkles className="h-6 w-6 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white">FoundryStack</h1>
            </motion.div>
            <motion.nav 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden md:flex space-x-8"
            >
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="/blueprints" className="text-gray-300 hover:text-white transition-colors">My Blueprints</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <AnimatedButton variant="outline" size="sm">
                Sign In
              </AnimatedButton>
            </motion.nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-6xl mx-auto">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-subtle border border-white/20 mb-12"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
            />
            <span className="text-sm text-white/90 font-medium">Our AI generates blueprints at all times</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
          >
            Support AI source code ability to{" "}
            <span className="gradient-text-pink">
              Think Fast
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-lg text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Through our advanced AI technology, we empower developers with the ability to think fast, produce more efficient code, and deliver amazing solutions in less time.
          </motion.p>
          
          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <AnimatedButton 
              variant="primary" 
              size="lg" 
              glow={true}
              delay={0.9}
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </AnimatedButton>
            <AnimatedButton 
              variant="outline" 
              size="lg"
              delay={1.0}
            >
              <Play className="h-5 w-5" />
              How it works
            </AnimatedButton>
          </motion.div>
          
          {/* Main Input Form */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="max-w-4xl mx-auto"
          >
            <GlassCard variant="strong" glow="purple" delay={1.2}>
              <div className="text-left mb-6">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 glow-blue"
                  >
                    <Brain className="h-5 w-5 text-white" />
                  </motion.div>
                  Describe Your Startup Idea
                </h3>
                <p className="text-gray-400 text-sm">
                  Be as detailed as possible. Include your target market, problem statement, and any specific requirements.
                </p>
              </div>
              <div className="space-y-6">
                <Textarea
                  placeholder="Example: I want to build a SaaS platform that helps small restaurants manage their inventory, reduce food waste, and optimize ordering. The target market is independent restaurants with 1-10 locations that struggle with manual inventory tracking and often over-order ingredients..."
                  value={idea}
                  onChange={(e) => {
                    setIdea(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                />
                
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-400 text-sm font-medium mb-1">Please fix the following issues:</p>
                        <ul className="text-red-300 text-sm space-y-1">
                          {validationErrors.map((error, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <p className="text-green-400 text-sm">{success}</p>
                  </motion.div>
                )}
                <AnimatedButton 
                  onClick={handleGenerateBlueprint}
                  disabled={!idea.trim() || isGenerating}
                  variant="primary"
                  size="lg"
                  glow={true}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="h-6 w-6" />
                      </motion.div>
                      Generating Blueprint...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6" />
                      Generate Blueprint
                    </>
                  )}
                </AnimatedButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            What You'll Get
          </h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Comprehensive analysis and actionable implementation plans
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Target,
              title: "Market Analysis",
              description: "Deep dive into target market, competition, and positioning strategy",
              gradient: "from-blue-600 to-blue-800",
              glow: "blue",
              delay: 0.1
            },
            {
              icon: FileText,
              title: "Technical Blueprint",
              description: "Complete architecture, tech stack recommendations, and API designs",
              gradient: "from-slate-600 to-slate-800",
              glow: "blue",
              delay: 0.2
            },
            {
              icon: Clock,
              title: "4-Week Plan",
              description: "Detailed sprint breakdown with milestones and deliverables",
              gradient: "from-indigo-600 to-indigo-800",
              glow: "purple",
              delay: 0.3
            },
            {
              icon: Github,
              title: "Code Templates",
              description: "Starter repositories and boilerplate code for rapid development",
              gradient: "from-blue-700 to-blue-900",
              glow: "pink",
              delay: 0.4
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -12,
                transition: { duration: 0.3 }
              }}
            >
              <GlassCard 
                variant="default" 
                glow={feature.glow as any}
                hover={true}
                delay={feature.delay}
                className="h-full"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className={`p-3 rounded-lg bg-gradient-to-r ${feature.gradient} w-fit mb-4 glow-${feature.glow}`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </motion.div>
                <h4 className="text-lg font-semibold text-white mb-3">{feature.title}</h4>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack Preview */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              Powered by Modern Tech Stack
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Built with the latest technologies for optimal performance and scalability
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: "AI Orchestration",
                description: "GPT-4 powered analysis and planning",
                gradient: "from-blue-600 to-blue-800",
                delay: 0.1
              },
              {
                icon: Database,
                title: "Vector Search",
                description: "Qdrant for pattern matching and retrieval",
                gradient: "from-slate-600 to-slate-800",
                delay: 0.2
              },
              {
                icon: Zap,
                title: "Fast Iteration",
                description: "Next.js + Python for rapid development",
                gradient: "from-indigo-600 to-indigo-800",
                delay: 0.3
              }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: tech.delay }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
              >
                <GlassCard variant="default" delay={tech.delay} className="h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                      className={`h-12 w-12 bg-gradient-to-r ${tech.gradient} rounded-xl flex items-center justify-center glow-${tech.gradient.split(' ')[1].split('-')[1]}`}
                    >
                      <tech.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{tech.title}</h4>
                      <p className="text-gray-400 text-sm">{tech.description}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10 border-t border-white/10 glass-subtle py-16"
      >
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 glow-blue"
            >
              <Sparkles className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white">FoundryStack</span>
          </motion.div>
          <p className="text-gray-400">
            © 2024 FoundryStack. Transform ideas into reality.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
