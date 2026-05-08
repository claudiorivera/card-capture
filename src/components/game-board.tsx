import { CaptureActionSelection } from "#/components/capture-action-selection";
import { CurrentPhase } from "#/components/current-phase";
import { DiscardPile } from "#/components/discard-pile";
import { DrawDeck } from "#/components/draw-deck";
import { Button } from "#/components/ui/button";
import { isJoker } from "#/lib/core/utils";
import {
	useGameContext,
	useGameSend,
	useGameSnapshot,
} from "#/lib/game-context";
import { cn } from "#/lib/utils";

export function GameBoard() {
	const context = useGameContext();
	const snapshot = useGameSnapshot();
	const send = useGameSend();

	return (
		<div className="flex flex-col gap-4 p-4">
			<CurrentPhase />

			<div className="grid grid-cols-6 gap-4">
				<DrawDeck cards={context.enemyDeck} />

				{context.enemySlots.map((slot, index) => (
					<Button
						key={slot !== null ? `${slot.value}-${slot.suit}` : index}
						className={cn(
							"h-32 w-18 p-4 text-xs",
							index === context.selectedEnemyCardIndex && "bg-muted",
						)}
						variant="outline"
						onClick={() => send({ type: "toggleEnemySlotSelection", index })}
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
					<Button
						key={slot !== null ? `${slot.value}-${slot.suit}` : index}
						className={cn(
							"h-32 w-18 p-4 text-xs",
							context.selectedPlayerCardIndices.includes(index) && "bg-muted",
						)}
						variant="outline"
						onClick={() => send({ type: "togglePlayerCardSelection", index })}
					>
						{slot === null
							? "X"
							: isJoker(slot)
								? "Joker"
								: `${slot.value} of ${slot.suit}`}
					</Button>
				))}

				<DiscardPile cards={context.playerDiscardPile} />
			</div>

			{snapshot.matches("discardPhase") && (
				<Button onClick={() => send({ type: "performPlayerDiscard" })}>
					Confirm player discard
				</Button>
			)}

			{snapshot.matches({ capturePhase: "selectingCaptureAction" }) && (
				<CaptureActionSelection />
			)}

			{snapshot.matches({
				capturePhase: "selectingPlayerCardForEnemyCapture",
			}) && (
				<Button
					disabled={context.selectedPlayerCardIndices.length < 1}
					onClick={() => send({ type: "performEnemyCapture" })}
				>
					Confirm enemy capture
				</Button>
			)}

			{snapshot.matches({ capturePhase: "selectingCardsForPlayerCapture" }) && (
				<Button onClick={() => send({ type: "performPlayerCapture" })}>
					Confirm player capture
				</Button>
			)}

			{snapshot.matches({ capturePhase: "selectingCardsForSacrifice" }) && (
				<Button
					disabled={
						context.selectedEnemyCardIndex === null ||
						context.selectedPlayerCardIndices.length < 2
					}
					onClick={() => send({ type: "performSacrifice" })}
				>
					Confirm sacrifice
				</Button>
			)}

			{snapshot.matches("lose") && <div>You lost! 😢</div>}
			{snapshot.matches("win") && <div>You won! 🥳</div>}
		</div>
	);
}
