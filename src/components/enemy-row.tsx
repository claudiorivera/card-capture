import { DiscardPile } from "#/components/discard-pile";
import { DrawDeck } from "#/components/draw-deck";
import { EnemyCardSlot } from "#/components/enemy-card-slot";
import { Separator } from "#/components/ui/separator";
import { useGameStore } from "#/lib/core/game-store";

export function EnemyRow() {
	const { enemyDeck, enemySlots, enemyDiscardPile } = useGameStore();

	return (
		<div className="flex justify-between">
			<DrawDeck cards={enemyDeck} />

			{enemySlots.map((slot, index) => (
				<EnemyCardSlot slot={slot} key={slot?.id ?? index} index={index} />
			))}

			<Separator orientation="vertical" />

			<DiscardPile cards={enemyDiscardPile} />
		</div>
	);
}
