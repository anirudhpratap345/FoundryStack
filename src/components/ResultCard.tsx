'use client';

import { ReactNode } from 'react';

type Props = {
	title: string;
	icon?: ReactNode;
	children: ReactNode;
};

export default function ResultCard({ title, icon, children }: Props) {
	return (
		<div className="glass-strong rounded-xl p-6 border border-white/10 hover-glow-border">
			<h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
				{icon}
				{title}
			</h3>
			<div className="text-sm text-white/80 leading-relaxed">
				{children}
			</div>
		</div>
	);
}


