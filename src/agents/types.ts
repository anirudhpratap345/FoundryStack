export interface StartupInput {
  industry: string;
  traction: { MRR: number; growth_rate: string };
  financials: { cash: number; runway_months: number };
  funding_intent: { stage?: string; timeline?: string; investors?: string };
  strategic_goals: string[];
}

export interface AgentOutput {
  funding_stage?: string;
  raise_amount?: string | number;
  investor_profiles?: string[];
  runway_plan?: { duration: string; allocation: Record<string, number> };
  financial_priorities?: string[];
  rationale?: string;
}


