import { DiscardPile } from "#/components/discard-pile";
import { DrawDeck } from "#/components/draw-deck";
import { PlayerCardSlot } from "#/components/player-card-slot";
import { Separator } from "#/components/ui/separator";
import { useGameStore } from "#/lib/core/game-store";

export function PlayerRow() {
	const { playerDeck, playerSlots, playerDiscardPile } = useGameStore();

	return (
		<div className="flex justify-between">
			<DrawDeck cards={playerDeck} />

			{playerSlots.map((slot, index) => (
				<PlayerCardSlot slot={slot} key={slot?.id ?? index} index={index} />
			))}

			<Separator orientation="vertical" />

			<DiscardPile cards={playerDiscardPile} />
		</div>
	);
}
