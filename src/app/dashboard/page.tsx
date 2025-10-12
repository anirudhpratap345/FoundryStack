'use client';

import { useEffect, useState } from 'react';
import ResponseViewer from '@/components/ResponseViewer';

export default function DashboardPage() {
	const [data, setData] = useState<any | null>(null);

	useEffect(() => {
		try {
			const raw = localStorage.getItem('finance_last_response');
			if (raw) setData(JSON.parse(raw));
		} catch {}
	}, []);

	return (
		<div className="min-h-screen bg-[#0d1117]">
			<div className="pt-24 pb-16 px-4">
				<div className="max-w-4xl mx-auto">
					<div className="mb-6">
						<h1 className="text-3xl font-bold text-white">Your Latest Strategy</h1>
						<p className="text-white/60 text-sm">This is the most recent result from your last generation.</p>
					</div>
					{data ? (
						<ResponseViewer data={data} />
					) : (
						<div className="glass-strong rounded-xl p-6 border border-white/10 text-white/70">
							No saved result yet. Generate a strategy first.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}


