'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import type { StartupInputs } from '@/types/finance-copilot';

interface FinanceInputFormProps {
  onSubmit: (inputs: StartupInputs) => Promise<void> | void;
  isLoading: boolean;
}

export default function FinanceInputForm({ onSubmit, isLoading }: FinanceInputFormProps) {
  const [inputs, setInputs] = useState<StartupInputs>({
    startupName: '',
    industry: '',
    targetMarket: 'B2B',
    geography: 'United States',
    teamSize: 1,
    productStage: 'Idea',
    monthlyRevenue: undefined,
    growthRate: '',
    tractionSummary: '',
    businessModel: '',
    fundingGoal: undefined,
    mainFinancialConcern: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const maybePromise = onSubmit(inputs);
      if (maybePromise && typeof (maybePromise as any).then === 'function') {
        (maybePromise as Promise<void>).catch((err) => {
          console.error('Form submit error:', err);
        });
      }
    } catch (err) {
      console.error('Form submit error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <div className="glass-strong rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="startupName" className="text-white/80">
              Startup Name / Idea *
            </Label>
            <Input
              id="startupName"
              value={inputs.startupName}
              onChange={(e) => setInputs({ ...inputs, startupName: e.target.value })}
              placeholder="e.g., AI-powered expense tracker"
              required
              className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <Label htmlFor="industry" className="text-white/80">
              Industry / Sector *
            </Label>
            <Input
              id="industry"
              value={inputs.industry}
              onChange={(e) => setInputs({ ...inputs, industry: e.target.value })}
              placeholder="e.g., Fintech, Healthcare, SaaS"
              required
              className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetMarket" className="text-white/80">
                Target Market
              </Label>
              <Select
                id="targetMarket"
                value={inputs.targetMarket}
                onValueChange={(value: any) => setInputs({ ...inputs, targetMarket: value })}
                className="mt-1.5"
              >
                <SelectItem value="B2B">B2B (Business to Business)</SelectItem>
                <SelectItem value="B2C">B2C (Business to Consumer)</SelectItem>
                <SelectItem value="B2B2C">B2B2C (Hybrid)</SelectItem>
              </Select>
            </div>

            <div>
              <Label htmlFor="geography" className="text-white/80">
                Geography / Base Country
              </Label>
              <Input
                id="geography"
                value={inputs.geography}
                onChange={(e) => setInputs({ ...inputs, geography: e.target.value })}
                placeholder="e.g., United States, India, UK"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Team & Product Section */}
      <div className="glass-strong rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Team & Product</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teamSize" className="text-white/80">
                Current Team Size
              </Label>
              <Input
                id="teamSize"
                type="number"
                min="1"
                value={inputs.teamSize}
                onChange={(e) => setInputs({ ...inputs, teamSize: parseInt(e.target.value) || 1 })}
                className="mt-1.5 bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label htmlFor="productStage" className="text-white/80">
                Stage of Product
              </Label>
              <Select
                id="productStage"
                value={inputs.productStage}
                onValueChange={(value: any) => setInputs({ ...inputs, productStage: value })}
                className="mt-1.5"
              >
                <SelectItem value="Idea">Idea (Concept stage)</SelectItem>
                <SelectItem value="MVP">MVP (Built)</SelectItem>
                <SelectItem value="Beta">Beta (Testing)</SelectItem>
                <SelectItem value="Early Revenue">Early Revenue</SelectItem>
                <SelectItem value="Growth">Growth Stage</SelectItem>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Traction & Revenue Section */}
      <div className="glass-strong rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Traction & Revenue</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthlyRevenue" className="text-white/80">
                Monthly Recurring Revenue (USD)
              </Label>
              <Input
                id="monthlyRevenue"
                type="number"
                min="0"
                value={inputs.monthlyRevenue || ''}
                onChange={(e) => setInputs({ ...inputs, monthlyRevenue: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Leave empty if pre-revenue"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <Label htmlFor="growthRate" className="text-white/80">
                Growth Rate (optional)
              </Label>
              <Input
                id="growthRate"
                value={inputs.growthRate}
                onChange={(e) => setInputs({ ...inputs, growthRate: e.target.value })}
                placeholder="e.g., 20% MoM, 100 signups/week"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tractionSummary" className="text-white/80">
              Traction Summary (optional)
            </Label>
            <Textarea
              id="tractionSummary"
              value={inputs.tractionSummary}
              onChange={(e) => setInputs({ ...inputs, tractionSummary: e.target.value })}
              placeholder="Any notable traction: users, partnerships, press coverage..."
              rows={3}
              className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Financial Details Section */}
      <div className="glass-strong rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Financial Details</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessModel" className="text-white/80">
              Business Model *
            </Label>
            <Input
              id="businessModel"
              value={inputs.businessModel}
              onChange={(e) => setInputs({ ...inputs, businessModel: e.target.value })}
              placeholder="e.g., SaaS subscription, Marketplace, Transaction fees"
              required
              className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <Label htmlFor="fundingGoal" className="text-white/80">
              Funding Goal (USD, optional)
            </Label>
            <Input
              id="fundingGoal"
              type="number"
              min="0"
              value={inputs.fundingGoal || ''}
              onChange={(e) => setInputs({ ...inputs, fundingGoal: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g., 500000 for $500K"
              className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <Label htmlFor="mainFinancialConcern" className="text-white/80">
              Main Financial Concern Right Now *
            </Label>
            <Textarea
              id="mainFinancialConcern"
              value={inputs.mainFinancialConcern}
              onChange={(e) => setInputs({ ...inputs, mainFinancialConcern: e.target.value })}
              placeholder="e.g., Need capital to hire engineers, Running out of runway, Need to prove PMF before raising"
              required
              rows={3}
              className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary-light h-12 text-base font-semibold"
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating Strategy...
          </span>
        ) : (
          'Generate Finance Strategy'
        )}
      </Button>

      <p className="text-xs text-white/40 text-center">
        * Required fields • Processing typically takes 10-20 seconds
      </p>
    </form>
  );
}

