import { EmptyCard } from "#/components/empty-card";
import { PlayingCard } from "#/components/playing-card";
import type { PlayingCard as PlayingCardType } from "#/lib/core/cards";

export function DiscardPile({ cards }: { cards: PlayingCardType[] }) {
	const topCard = cards.at(-1);

	if (!topCard) return <EmptyCard />;

	return <PlayingCard card={topCard} />;
}
