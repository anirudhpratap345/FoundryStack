'use client';

type Props = {
	message: string;
	ctaLabel?: string;
	onCta?: () => void;
};

export default function ErrorCard({ message, ctaLabel, onCta }: Props) {
	return (
		<div className="glass-strong rounded-xl p-6 border border-red-500/20 bg-red-500/5">
			<div className="flex items-start gap-3">
				<span className="text-2xl">⚠️</span>
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-red-400 mb-2">Something went wrong</h3>
					<p className="text-sm text-white/80 mb-4 break-words">{message}</p>
					{ctaLabel && onCta && (
						<button
							onClick={onCta}
							className="text-sm px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
						>
							{ctaLabel}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}


