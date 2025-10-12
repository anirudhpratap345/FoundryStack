'use client';

export default function LoadingState() {
	return (
		<div className="glass-strong rounded-xl p-12 border border-white/10 text-center">
			<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-6">
				<svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
				</svg>
			</div>
			<h3 className="text-xl font-semibold text-white mb-2">Generating Your Strategy...</h3>
			<p className="text-sm text-white/60 mb-4">Analyzing your inputs and crafting a personalized plan.</p>
		</div>
	);
}


