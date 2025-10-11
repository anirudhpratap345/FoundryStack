import type { StartupInput, AgentOutput } from './types';
import { FundingStageAgent } from './FundingStageAgent';
import { RaiseAmountAgent } from './RaiseAmountAgent';

export async function runFinanceAgents(input: StartupInput): Promise<AgentOutput> {
  const funding = await FundingStageAgent(input);
  const raise = await RaiseAmountAgent({ ...input, ...funding });
  return { ...funding, ...raise };
}


