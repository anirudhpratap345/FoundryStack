'use client';

import Pricing from '@/components/Pricing';

export default function PricingPage() {
	return (
		<div className="min-h-screen bg-[#0d1117]">
			<div className="pt-24 pb-16 px-4">
				<div className="max-w-5xl mx-auto">
					<h1 className="text-3xl font-bold text-white mb-6">Upgrade</h1>
					<Pricing />
				</div>
			</div>
		</div>
	);
}


