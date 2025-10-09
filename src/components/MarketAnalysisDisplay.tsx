"use client";

import { MarketAnalysis } from "@/lib/ai/openai";
import { TrendingUp, Users, Target, DollarSign, AlertTriangle, CheckCircle, BarChart3, PieChart, Globe, Shield, Zap } from "lucide-react";

interface MarketAnalysisDisplayProps {
  analysis: MarketAnalysis;
}

export default function MarketAnalysisDisplay({ analysis }: MarketAnalysisDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      {analysis.executiveSummary && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Executive Summary
          </h3>
          <p className="text-gray-300 leading-relaxed">{analysis.executiveSummary}</p>
        </div>
      )}

      {/* Target Market */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Target Market Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Primary Market</h4>
            <p className="text-gray-300 mb-4">{analysis.targetMarket.primary}</p>
            
            {analysis.targetMarket.secondary && (
              <>
                <h4 className="text-lg font-semibold text-white mb-3">Secondary Market</h4>
                <p className="text-gray-300 mb-4">{analysis.targetMarket.secondary}</p>
              </>
            )}
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Market Size</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">TAM:</span>
                <span className="text-white font-semibold">{analysis.targetMarket.size?.totalAddressableMarket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SAM:</span>
                <span className="text-white font-semibold">{analysis.targetMarket.size?.serviceableAddressableMarket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SOM:</span>
                <span className="text-white font-semibold">{analysis.targetMarket.size?.serviceableObtainableMarket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Growth Rate:</span>
                <span className="text-green-400 font-semibold">{analysis.targetMarket.size?.growthRate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demographics */}
        {analysis.targetMarket.demographics && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Demographics</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-white font-medium mb-2">Age</h5>
                <p className="text-gray-300 text-sm">{analysis.targetMarket.demographics.age}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-white font-medium mb-2">Income</h5>
                <p className="text-gray-300 text-sm">{analysis.targetMarket.demographics.income}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-white font-medium mb-2">Location</h5>
                <p className="text-gray-300 text-sm">{analysis.targetMarket.demographics.location}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-white font-medium mb-2">Education</h5>
                <p className="text-gray-300 text-sm">{analysis.targetMarket.demographics.education}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-white font-medium mb-2">Profession</h5>
                <p className="text-gray-300 text-sm">{analysis.targetMarket.demographics.profession}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Competition */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Competitive Landscape
        </h3>
        
        <div className="space-y-6">
          {analysis.competition && analysis.competition.map((competitor, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-white">{competitor.name}</h4>
                <div className="text-right text-sm text-gray-400">
                  {competitor.marketShare && <div>Market Share: {competitor.marketShare}</div>}
                  {competitor.funding && <div>Funding: {competitor.funding}</div>}
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">{competitor.description}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-medium mb-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Strengths
                  </h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {competitor.strengths && competitor.strengths.map((strength, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-white font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    Weaknesses
                  </h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {competitor.weaknesses && competitor.weaknesses.map((weakness, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {competitor.keyFeatures && (
                <div className="mt-4">
                  <h5 className="text-white font-medium mb-2">Key Features</h5>
                  <div className="flex flex-wrap gap-2">
                    {competitor.keyFeatures && competitor.keyFeatures.map((feature, i) => (
                      <span key={i} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Market Trends */}
      {analysis.marketTrends && analysis.marketTrends.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Trends
          </h3>
          
          <div className="space-y-4">
            {analysis.marketTrends && analysis.marketTrends.map((trend, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-white">{trend.trend}</h4>
                  <span className="text-sm text-gray-400">{trend.timeline}</span>
                </div>
                <p className="text-gray-300 mb-3">{trend.description}</p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Impact:</span>
                    <p className="text-white">{trend.impact}</p>
                  </div>
                  {trend.marketValue && (
                    <div>
                      <span className="text-gray-400">Market Value:</span>
                      <p className="text-white">{trend.marketValue}</p>
                    </div>
                  )}
                  {trend.adoptionRate && (
                    <div>
                      <span className="text-gray-400">Adoption Rate:</span>
                      <p className="text-white">{trend.adoptionRate}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Model */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue Model
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Primary Revenue</h4>
            <p className="text-gray-300 mb-4">{analysis.revenueModel.primary}</p>
            
            {analysis.revenueModel.secondary && (
              <>
                <h4 className="text-lg font-semibold text-white mb-3">Secondary Revenue</h4>
                <p className="text-gray-300 mb-4">{analysis.revenueModel.secondary}</p>
              </>
            )}
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Pricing Strategy</h4>
            <p className="text-gray-300 mb-4">{analysis.revenueModel.pricingStrategy}</p>
          </div>
        </div>

        {/* Unit Economics */}
        {analysis.revenueModel.unitEconomics && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Unit Economics</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <h5 className="text-white font-medium mb-2">CAC</h5>
                <p className="text-2xl font-bold text-blue-400">{analysis.revenueModel.unitEconomics.customerAcquisitionCost}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <h5 className="text-white font-medium mb-2">LTV</h5>
                <p className="text-2xl font-bold text-green-400">{analysis.revenueModel.unitEconomics.lifetimeValue}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <h5 className="text-white font-medium mb-2">Gross Margin</h5>
                <p className="text-2xl font-bold text-purple-400">{analysis.revenueModel.unitEconomics.grossMargin}</p>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Projections */}
        {analysis.revenueModel.projections && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Revenue Projections</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <h5 className="text-white font-medium mb-2">Year 1</h5>
                <p className="text-xl font-bold text-green-400">{analysis.revenueModel.projections.year1}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <h5 className="text-white font-medium mb-2">Year 2</h5>
                <p className="text-xl font-bold text-green-400">{analysis.revenueModel.projections.year2}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <h5 className="text-white font-medium mb-2">Year 3</h5>
                <p className="text-xl font-bold text-green-400">{analysis.revenueModel.projections.year3}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Personas */}
      {analysis.customerPersonas && analysis.customerPersonas.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Personas
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.customerPersonas && analysis.customerPersonas.map((persona, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-2">{persona.name}</h4>
                <div className="text-sm text-gray-400 mb-4">
                  {persona.age} • {persona.profession}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-white font-medium mb-2">Pain Points</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {persona.painPoints && persona.painPoints.map((pain, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                          {pain}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-medium mb-2">Goals</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {persona.goals && persona.goals.map((goal, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Budget:</span>
                      <p className="text-white">{persona.budget}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Influence:</span>
                      <p className="text-white">{persona.influence}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {analysis.risks && analysis.risks.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Assessment
          </h3>
          
          <div className="space-y-4">
            {analysis.risks && analysis.risks.map((risk, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-white">{risk.risk}</h4>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-400">
                      Probability: <span className="text-white">{risk.probability}</span>
                    </span>
                    <span className="text-gray-400">
                      Impact: <span className="text-white">{risk.impact}</span>
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-3">{risk.description}</p>
                <div>
                  <span className="text-gray-400 text-sm">Mitigation:</span>
                  <p className="text-white text-sm">{risk.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
