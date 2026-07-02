import { CardSlotButton } from "#/components/card-slot-button";
import { EmptyCard } from "#/components/empty-card";
import { PlayingCard } from "#/components/playing-card";
import type { Slot } from "#/lib/core/cards";
import { useGameStore } from "#/lib/core/game-store";

export function EnemyCardSlot({ slot, index }: { slot: Slot; index: number }) {
	const { selectedEnemyCardIndex, toggleEnemySlotSelection } = useGameStore();

	const isSelected = selectedEnemyCardIndex === index;

	return (
		<CardSlotButton
			isSelected={isSelected}
			onClick={() => toggleEnemySlotSelection(index)}
		>
			{slot ? <PlayingCard card={slot} /> : <EmptyCard />}
		</CardSlotButton>
	);
}
