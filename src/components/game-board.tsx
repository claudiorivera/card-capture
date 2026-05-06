import { useState } from "react";
import { CaptureActionSelection } from "#/components/capture-action-selection";
import { CurrentPhase } from "#/components/current-phase";
import { DiscardPile } from "#/components/discard-pile";
import { DrawDeck } from "#/components/draw-deck";
import { EnemyCapturePlayerCardSelection } from "#/components/enemy-capture-player-card-selection";
import { PlayerCaptureEnemyCardSelection } from "#/components/player-capture-enemy-card-selection";
import { PlayerCapturePlayerCardSelection } from "#/components/player-capture-player-card-selection";
import { PlayerDiscardCardSelection } from "#/components/player-discard-card-selection";
import { Button } from "#/components/ui/button";
import { Toggle } from "#/components/ui/toggle";
import { isJoker } from "#/lib/core/utils";
import { useGameContext, useGameSnapshot } from "#/lib/game-context";
import { cn } from "#/lib/utils";

export function GameBoard() {
	const context = useGameContext();
	const snapshot = useGameSnapshot();
	const [selectedPlayerSlots, setSelectedPlayerSlots] = useState<Set<number>>(
		new Set(),
	);
	const [selectedEnemySlot, setSelectedEnemySlot] = useState<number>();

	return (
		<div className="flex flex-col gap-4 p-4">
			<CurrentPhase />

			<div className="grid grid-cols-6 gap-4">
				<DrawDeck cards={context.enemyDeck} />

				{context.enemySlots.map((slot, index) => (
					<Button
						key={slot !== null ? `${slot.value}-${slot.suit}` : index}
						className={cn(
							"h-32 w-18 p-4",
							index === selectedEnemySlot && "bg-muted",
						)}
						variant="outline"
						onClick={() => setSelectedEnemySlot(index)}
					>
						{slot === null
							? "X"
							: isJoker(slot)
								? "Joker"
								: `${slot.value} of ${slot.suit}`}
					</Button>
				))}

				<DiscardPile cards={context.enemyDiscardPile} />
			</div>

			<div className="grid grid-cols-6 gap-4">
				<DrawDeck cards={context.playerDeck} />

				{context.playerSlots.map((slot, index) => (
					<Toggle
						key={slot !== null ? `${slot.value}-${slot.suit}` : index}
						onClick={() => {
							const newSelectedPlayerSlots = new Set(selectedPlayerSlots);

							if (newSelectedPlayerSlots.has(index)) {
								newSelectedPlayerSlots.delete(index);
							} else {
								newSelectedPlayerSlots.add(index);
							}

							setSelectedPlayerSlots(newSelectedPlayerSlots);
						}}
						className="h-32 w-18 p-4"
						variant="outline"
					>
						{slot === null
							? "X"
							: isJoker(slot)
								? "Joker"
								: `${slot.value} of ${slot.suit}`}
					</Toggle>
				))}

				<DiscardPile cards={context.playerDiscardPile} />
			</div>

			{snapshot.matches("discardPhase") && (
				<PlayerDiscardCardSelection slots={Array.from(selectedPlayerSlots)} />
			)}

			{snapshot.matches({ capturePhase: "selectingCaptureAction" }) && (
				<CaptureActionSelection />
			)}

			{snapshot.matches({
				capturePhase: "selectingEnemySlotForPlayerCapture",
			}) && <PlayerCaptureEnemyCardSelection slot={selectedEnemySlot} />}

			{snapshot.matches({
				capturePhase: "selectingPlayerCardsForPlayerCapture",
			}) && (
				<PlayerCapturePlayerCardSelection
					slots={Array.from(selectedPlayerSlots)}
					enemySlot={selectedEnemySlot}
				/>
			)}

			{snapshot.matches({
				capturePhase: "selectingPlayerCardForEnemyCapture",
			}) && (
				<EnemyCapturePlayerCardSelection
					slots={Array.from(selectedPlayerSlots)}
				/>
			)}
		</div>
	);
}
