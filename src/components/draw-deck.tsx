import { Card } from "#/components/ui/card";
import type { PlayingCard } from "#/lib/core/cards";

export function DrawDeck({ cards }: { cards: PlayingCard[] }) {
	return (
		<Card className="h-36 relative w-24 font-black text-2xl border-2">
			<svg
				className="absolute inset-0 size-full"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				aria-label="Card back pattern"
			>
				<defs>
					<pattern
						id="hatch"
						patternUnits="userSpaceOnUse"
						width="4"
						height="4"
					>
						<path
							d="M-2,2 l4,-4 M0,4 l4,-4 M2,6 l4,-4"
							className="stroke-blue-500"
						/>
					</pattern>
				</defs>
				<rect width="100" height="100" fill="url(#hatch)" />
			</svg>

			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-background text-foreground">
				{cards.length}
			</div>
		</Card>
	);
}
