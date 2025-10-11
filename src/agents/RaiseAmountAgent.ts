import { callGemini, parseGeminiJSON } from '@/lib/gemini';
import type { StartupInput, AgentOutput } from './types';

export async function RaiseAmountAgent(context: StartupInput & AgentOutput): Promise<AgentOutput> {
  const prompt = `You are a finance advisor for startup founders.
Given the startup profile and the decided funding stage, suggest an ideal raise amount.

Return ONLY valid JSON with this shape:
{
  "raise_amount": "e.g., $1.2M (range $800k-$2.0M)",
  "rationale": "Short reasoning",
  "financial_priorities": ["hiring", "product", "gtm", "ops"]
}

Context:
${JSON.stringify(context, null, 2)}
`;

  const result = await callGemini(prompt, 0.25);
  return parseGeminiJSON<AgentOutput>(result);
}


