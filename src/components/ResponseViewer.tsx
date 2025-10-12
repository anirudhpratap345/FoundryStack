'use client';

import ResultCard from './ResultCard';

type Props = {
	data: any; // backend response.response shape
};

export default function ResponseViewer({ data }: Props) {
	// defensive access since API may vary slightly
	const funding = data?.funding_stage ?? data?.fundingStage;
	const raise = data?.raise_amount ?? data?.raiseAmount;
	const investors = data?.investor_type ?? data?.investorType;
	const runway = data?.runway;
	const financial = data?.financial_priority ?? data?.financialPriority;
	const summary = data?.summary;

	return (
		<div className="space-y-6">
			{funding && (
				<ResultCard title="Funding Stage" icon={<span className="text-2xl">🎯</span>}>
					<div className="space-y-2">
						<div className="text-lg font-semibold text-white">{funding.funding_stage || funding.stage}</div>
						{funding.confidence && (
							<div className="text-xs text-white/60">Confidence: {funding.confidence}</div>
						)}
						{funding.rationale && (
							<p className="text-sm text-white/70">{funding.rationale}</p>
						)}
					</div>
				</ResultCard>
			)}

			{raise && (
				<ResultCard title="Raise Amount" icon={<span className="text-2xl">💰</span>}>
					<div className="space-y-2">
						<div className="text-2xl font-bold text-white">{raise.recommended_amount || raise.recommended}</div>
						{raise.range && (
							<div className="text-xs text-white/60">Range: {raise.range.min} - {raise.range.max}</div>
						)}
						{raise.breakdown && (
							<div className="text-xs text-white/60">
								<div className="font-semibold mb-1">Breakdown</div>
								<pre className="whitespace-pre-wrap break-words">{JSON.stringify(raise.breakdown, null, 2)}</pre>
							</div>
						)}
						{raise.rationale && (
							<p className="text-sm text-white/70">{raise.rationale}</p>
						)}
					</div>
				</ResultCard>
			)}

			{investors && (
				<ResultCard title="Investor Types" icon={<span className="text-2xl">🤝</span>}>
					<div className="space-y-2">
						{investors.primary_investor_type && (
							<div className="text-white font-semibold">Primary: {investors.primary_investor_type}</div>
						)}
						{Array.isArray(investors.secondary_options) && investors.secondary_options.length > 0 && (
							<div className="text-white/80 text-sm">Secondary: {investors.secondary_options.join(', ')}</div>
						)}
						{investors.rationale && (
							<p className="text-sm text-white/70">{investors.rationale}</p>
						)}
					</div>
				</ResultCard>
			)}

			{runway && (
				<ResultCard title="Runway & Burn" icon={<span className="text-2xl">📊</span>}>
					<div className="space-y-2">
						{runway.estimated_runway_months && (
							<div className="text-2xl font-bold text-white">{runway.estimated_runway_months} months</div>
						)}
						{runway.monthly_burn_rate && (
							<div className="text-sm text-white/60">Monthly burn: {runway.monthly_burn_rate}</div>
						)}
						{runway.burn_rate_guidance && (
							<p className="text-sm text-white/70">{runway.burn_rate_guidance}</p>
						)}
						{Array.isArray(runway.key_milestones) && runway.key_milestones.length > 0 && (
							<div className="text-xs text-white/60">
								<div className="font-semibold mb-1">Key Milestones:</div>
								<ul className="list-disc list-inside space-y-1">
									{runway.key_milestones.map((m: string, i: number) => (
										<li key={i}>{m}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</ResultCard>
			)}

			{financial && (
				<ResultCard title="Financial Priorities" icon={<span className="text-2xl">🧭</span>}>
					<div className="space-y-3">
						{Array.isArray(financial.priorities) && financial.priorities.map((p: any, i: number) => (
							<div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
								<div className="flex justify-between items-center mb-1">
									<div className="text-white font-semibold">{p.priority || p.category}</div>
									{p.importance && <div className="text-xs text-white/60">{p.importance}</div>}
								</div>
								{p.rationale && <div className="text-xs text-white/70">{p.rationale}</div>}
							</div>
						))}
					</div>
				</ResultCard>
			)}

			{summary && (
				<ResultCard title="Summary" icon={<span className="text-2xl">📝</span>}>
					<p className="whitespace-pre-wrap">{summary}</p>
				</ResultCard>
			)}
		</div>
	);
}


