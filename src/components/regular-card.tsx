import type { RegularCard as RegularCardType } from "#/lib/core/cards";

const suitSymbolBySuit = {
	HEARTS: "♥",
	DIAMONDS: "♦",
	CLUBS: "♣",
	SPADES: "♠",
} as const;

const redSuitSet = new Set(["HEARTS", "DIAMONDS"]);

function getCardRankLabel(value: number) {
	if (value === 11) return "J";
	if (value === 12) return "Q";
	if (value === 13) return "K";
	if (value === 14) return "A";

	return String(value);
}

export function RegularCard({ card }: { card: RegularCardType }) {
	return (
		<div data-red-suit={redSuitSet.has(card.suit) || undefined}>
			<div>{getCardRankLabel(card.value)}</div>
			<div>{suitSymbolBySuit[card.suit]}</div>
		</div>
	);
}
