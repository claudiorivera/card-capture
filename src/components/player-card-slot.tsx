import { CardSlotButton } from "#/components/card-slot-button";
import { EmptyCard } from "#/components/empty-card";
import { PlayingCard } from "#/components/playing-card";
import type { Slot } from "#/lib/core/cards";
import { useGameStore } from "#/lib/core/game-store";

export function PlayerCardSlot({ slot, index }: { slot: Slot; index: number }) {
	const { selectedPlayerCardIndices, togglePlayerCardSelection } =
		useGameStore();

	const isSelected = selectedPlayerCardIndices.includes(index);

	return (
		<CardSlotButton
			isSelected={isSelected}
			onClick={() => togglePlayerCardSelection(index)}
		>
			{slot ? <PlayingCard card={slot} /> : <EmptyCard />}
		</CardSlotButton>
	);
}
