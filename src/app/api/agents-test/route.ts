import { NextRequest, NextResponse } from 'next/server';
import { runFinanceAgents } from '@/agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = body?.input ?? {
      industry: 'SaaS',
      traction: { MRR: 12000, growth_rate: '12% MoM' },
      financials: { cash: 250000, runway_months: 10 },
      funding_intent: { stage: undefined, timeline: '3-6 months', investors: 'Angels/Seed VC' },
      strategic_goals: ['grow revenue', 'hire engineers', 'expand GTM']
    };

    const result = await runFinanceAgents(input);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


