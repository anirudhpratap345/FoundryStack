"use client";

import { TechnicalBlueprint } from "@/lib/ai/openai";
import { Code, Database, Shield, Zap, Server, Monitor, DollarSign, GitBranch, Layers, Cpu, Globe, BarChart3 } from "lucide-react";

interface TechnicalBlueprintDisplayProps {
  blueprint: TechnicalBlueprint;
}

export default function TechnicalBlueprintDisplay({ blueprint }: TechnicalBlueprintDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Architecture Overview */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Layers className="h-5 w-5" />
          System Architecture
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Overview</h4>
            <p className="text-gray-300">
              {typeof blueprint.architecture === 'string' 
                ? blueprint.architecture 
                : blueprint.architecture.overview || 'Architecture overview not available'
              }
            </p>
          </div>
          
          {typeof blueprint.architecture === 'object' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Architecture Pattern</h4>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                  {blueprint.architecture.pattern || 'Not specified'}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Data Flow</h4>
                <p className="text-gray-300 text-sm">{blueprint.architecture.dataFlow || 'Not specified'}</p>
              </div>
            </div>
          )}
          
          {/* Components */}
          {blueprint.architecture.components && blueprint.architecture.components.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">System Components</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {blueprint.architecture.components.map((component, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">{component.name}</h5>
                    <p className="text-gray-300 text-sm mb-2">{component.description}</p>
                    <div className="text-xs text-gray-400">
                      <div>Tech: {component.technology}</div>
                      <div>Scaling: {component.scaling}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Code className="h-5 w-5" />
          Technology Stack
        </h3>
        
        <div className="space-y-6">
          {blueprint.techStack && blueprint.techStack.map((tech, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">{tech.name}</h4>
                  <div className="text-sm text-gray-400">
                    {tech.category} • v{tech.version}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  {tech.learningCurve && <div>Learning: {tech.learningCurve}</div>}
                  {tech.community && <div>Community: {tech.community}</div>}
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">{tech.rationale}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {tech.pros && tech.pros.length > 0 && (
                  <div>
                    <h5 className="text-white font-medium mb-2">Pros</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {tech.pros.map((pro, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {tech.cons && tech.cons.length > 0 && (
                  <div>
                    <h5 className="text-white font-medium mb-2">Cons</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {tech.cons.map((con, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {tech.alternatives && tech.alternatives.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-white font-medium mb-2">Alternatives</h5>
                  <div className="flex flex-wrap gap-2">
                    {tech.alternatives.map((alt, i) => (
                      <span key={i} className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-sm">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* API Design */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          API Design
        </h3>
        
        <div className="space-y-4">
          {blueprint.apiDesign && blueprint.apiDesign.map((api, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  api.method === 'GET' ? 'bg-green-500/20 text-green-300' :
                  api.method === 'POST' ? 'bg-blue-500/20 text-blue-300' :
                  api.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {api.method}
                </span>
                <code className="text-white font-mono">{api.endpoint}</code>
              </div>
              
              <p className="text-gray-300 mb-4">{api.description}</p>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {api.authentication && (
                  <div>
                    <span className="text-gray-400">Auth:</span>
                    <p className="text-white">{api.authentication}</p>
                  </div>
                )}
                {api.rateLimit && (
                  <div>
                    <span className="text-gray-400">Rate Limit:</span>
                    <p className="text-white">{api.rateLimit}</p>
                  </div>
                )}
                {api.versioning && (
                  <div>
                    <span className="text-gray-400">Versioning:</span>
                    <p className="text-white">{api.versioning}</p>
                  </div>
                )}
              </div>
              
              {api.examples && (
                <div className="mt-4">
                  <h5 className="text-white font-medium mb-2">Examples</h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    {api.examples.request && (
                      <div>
                        <h6 className="text-gray-400 text-sm mb-1">Request</h6>
                        <pre className="bg-black/20 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                          {api.examples.request}
                        </pre>
                      </div>
                    )}
                    {api.examples.response && (
                      <div>
                        <h6 className="text-gray-400 text-sm mb-1">Response</h6>
                        <pre className="bg-black/20 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                          {api.examples.response}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Database Schema */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Architecture
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Overview</h4>
            <p className="text-gray-300">
              {typeof blueprint.databaseSchema === 'string' 
                ? blueprint.databaseSchema 
                : blueprint.databaseSchema.overview || 'Database schema overview not available'
              }
            </p>
          </div>
          
          {typeof blueprint.databaseSchema === 'object' && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">Scaling</h5>
                <p className="text-gray-300 text-sm">{blueprint.databaseSchema.scaling || 'Not specified'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">Backup</h5>
                <p className="text-gray-300 text-sm">{blueprint.databaseSchema.backup || 'Not specified'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">Migrations</h5>
                <p className="text-gray-300 text-sm">{blueprint.databaseSchema.migrations || 'Not specified'}</p>
              </div>
            </div>
          )}
          
          {/* Tables */}
          {typeof blueprint.databaseSchema === 'object' && blueprint.databaseSchema.tables && blueprint.databaseSchema.tables.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Database Tables</h4>
              <div className="space-y-4">
                {blueprint.databaseSchema.tables.map((table, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2">{table.name}</h5>
                  <p className="text-gray-300 text-sm mb-3">{table.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-white font-medium mb-2">Columns</h6>
                      <div className="space-y-1">
                        {table.columns.map((column, i) => (
                          <div key={i} className="text-sm">
                            <span className="text-white font-mono">{column.name}</span>
                            <span className="text-gray-400 mx-2">({column.type})</span>
                            <span className="text-gray-300">{column.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h6 className="text-white font-medium mb-2">Indexes</h6>
                      <div className="flex flex-wrap gap-2">
                        {table.indexes.map((index, i) => (
                          <span key={i} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                            {index}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security */}
      {blueprint.security && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Implementation
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Authentication</h4>
                <p className="text-gray-300 text-sm">{blueprint.security.authentication}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Authorization</h4>
                <p className="text-gray-300 text-sm">{blueprint.security.authorization}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Data Encryption</h4>
                <p className="text-gray-300 text-sm">{blueprint.security.dataEncryption}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">API Security</h4>
                <p className="text-gray-300 text-sm">{blueprint.security.apiSecurity}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Vulnerability Management</h4>
                <p className="text-gray-300 text-sm">{blueprint.security.vulnerabilityManagement}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Compliance</h4>
                <p className="text-gray-300 text-sm">{blueprint.security.compliance}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance */}
      {blueprint.performance && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Optimization
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Optimization</h4>
                <p className="text-gray-300 text-sm">{blueprint.performance.optimization}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Caching</h4>
                <p className="text-gray-300 text-sm">{blueprint.performance.caching}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">CDN</h4>
                <p className="text-gray-300 text-sm">{blueprint.performance.cdn}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Load Balancing</h4>
                <p className="text-gray-300 text-sm">{blueprint.performance.loadBalancing}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Monitoring</h4>
                <p className="text-gray-300 text-sm">{blueprint.performance.monitoring}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deployment */}
      {blueprint.deployment && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Server className="h-5 w-5" />
            Deployment & DevOps
          </h3>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Strategy</h4>
                <p className="text-gray-300 text-sm">{blueprint.deployment.strategy}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Infrastructure</h4>
                <p className="text-gray-300 text-sm">{blueprint.deployment.infrastructure}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Environments</h4>
              <div className="flex flex-wrap gap-2">
                {blueprint.deployment.environments.map((env, i) => (
                  <span key={i} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                    {env}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">CI/CD Pipeline</h4>
                <p className="text-gray-300 text-sm">{blueprint.deployment.ciCd}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Auto-scaling</h4>
                <p className="text-gray-300 text-sm">{blueprint.deployment.scaling}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Disaster Recovery</h4>
              <p className="text-gray-300 text-sm">{blueprint.deployment.disasterRecovery}</p>
            </div>
          </div>
        </div>
      )}

      {/* Monitoring */}
      {blueprint.monitoring && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Monitoring & Observability
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Tools</h4>
              <div className="flex flex-wrap gap-2">
                {blueprint.monitoring.tools.map((tool, i) => (
                  <span key={i} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Key Metrics</h4>
                <p className="text-gray-300 text-sm">{blueprint.monitoring.metrics}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Alerting</h4>
                <p className="text-gray-300 text-sm">{blueprint.monitoring.alerting}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Logging</h4>
                <p className="text-gray-300 text-sm">{blueprint.monitoring.logging}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Observability</h4>
                <p className="text-gray-300 text-sm">{blueprint.monitoring.observability}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Optimization */}
      {blueprint.costOptimization && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Optimization
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Infrastructure</h4>
              <p className="text-gray-300 text-sm">{blueprint.costOptimization.infrastructure}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Licensing</h4>
              <p className="text-gray-300 text-sm">{blueprint.costOptimization.licensing}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Scaling</h4>
              <p className="text-gray-300 text-sm">{blueprint.costOptimization.scaling}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Budget</h4>
              <p className="text-2xl font-bold text-green-400">{blueprint.costOptimization.budget}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
