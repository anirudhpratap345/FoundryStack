import { callGemini, parseGeminiJSON } from '@/lib/gemini';
import type { StartupInput, AgentOutput } from './types';

export async function FundingStageAgent(input: StartupInput): Promise<AgentOutput> {
  const prompt = `You are a finance advisor for startup founders.
Based on the following startup profile, determine the most suitable funding stage.

Return ONLY valid JSON matching exactly this schema:
{
  "funding_stage": "Pre-Seed | Seed | Series A | Series B | Growth",
  "rationale": "Reason for this stage"
}

Startup data:
${JSON.stringify(input, null, 2)}
`;

  const result = await callGemini(prompt, 0.2);
  return parseGeminiJSON<AgentOutput>(result);
}


