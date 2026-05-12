import { CardSlot } from "#/components/card-slot";
import { EmptyCard } from "#/components/empty-card";
import { Joker } from "#/components/joker";
import { RegularCard } from "#/components/regular-card";
import type {
	PlayingCard,
	RegularCard as RegularCardType,
} from "#/lib/core/cards";
import { isJoker } from "#/lib/core/utils";

export function DiscardPile({ cards }: { cards: PlayingCard[] }) {
	const topCard = cards.at(-1);

	return (
		<CardSlot isSelected={false} onSelect={() => {}} className="bg-muted">
			{topCard ? (
				isJoker(topCard) ? (
					<Joker />
				) : (
					<RegularCard card={topCard as RegularCardType} />
				)
			) : (
				<EmptyCard />
			)}
		</CardSlot>
	);
}
