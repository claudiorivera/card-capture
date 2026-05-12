import { useMachine } from "@xstate/react";
import { CardSlot } from "#/components/card-slot";
import { DiscardPile } from "#/components/discard-pile";
import { DrawDeck } from "#/components/draw-deck";
import { EmptyCard } from "#/components/empty-card";
import { Joker } from "#/components/joker";
import { RegularCard } from "#/components/regular-card";
import { Button } from "#/components/ui/button";
import { gameMachine } from "#/lib/core/game-machine";
import { isJoker } from "#/lib/core/utils";

export function GameBoard() {
	const [state, send] = useMachine(gameMachine);

	return (
		<div className="flex flex-col gap-8">
			<div className="grid grid-cols-6 gap-4">
				<DrawDeck cards={state.context.enemyDeck} />

				{state.context.enemySlots.map((slot, index) => (
					<CardSlot
						isSelected={state.context.selectedEnemyCardIndex === index}
						key={slot ? slot.id : `enemy-slot-${index}`}
						onSelect={() => send({ type: "toggleEnemySlotSelection", index })}
					>
						{slot ? (
							isJoker(slot) ? (
								<Joker />
							) : (
								<RegularCard card={slot} />
							)
						) : (
							<EmptyCard />
						)}
					</CardSlot>
				))}

				<DiscardPile cards={state.context.enemyDiscardPile} />
			</div>

			<div className="grid grid-cols-6 gap-4">
				<DrawDeck cards={state.context.playerDeck} />

				{state.context.playerSlots.map((slot, index) => (
					<CardSlot
						key={slot ? slot.id : `player-slot-${index}`}
						isSelected={state.context.selectedPlayerCardIndices.includes(index)}
						onSelect={() => send({ type: "togglePlayerCardSelection", index })}
					>
						{slot ? (
							isJoker(slot) ? (
								<Joker />
							) : (
								<RegularCard card={slot} />
							)
						) : (
							<EmptyCard />
						)}
					</CardSlot>
				))}

				<DiscardPile cards={state.context.playerDiscardPile} />
			</div>

			{state.matches("discardPhase") && (
				<Button onClick={() => send({ type: "performPlayerDiscard" })}>
					Confirm player discard
				</Button>
			)}

			{state.matches({ capturePhase: "selectingCaptureAction" }) && (
				<div className="grid grid-cols-3 gap-4">
					<Button onClick={() => send({ type: "selectPlayerCaptureAction" })}>
						Player Capture
					</Button>

					<Button onClick={() => send({ type: "selectEnemyCaptureAction" })}>
						Enemy Capture
					</Button>

					<Button onClick={() => send({ type: "selectSacrificeAction" })}>
						Sacrifice
					</Button>
				</div>
			)}

			{state.matches({
				capturePhase: "selectingPlayerCardForEnemyCapture",
			}) && (
				<>
					<Button
						disabled={state.context.selectedPlayerCardIndices.length < 1}
						onClick={() => {
							const playerSlotIndex =
								state.context.selectedPlayerCardIndices[0];

							if (playerSlotIndex !== undefined) {
								send({
									type: "performEnemyCapture",
								});
							}
						}}
					>
						Confirm enemy capture
					</Button>
					<Button
						variant="outline"
						onClick={() => send({ type: "backToCaptureSelection" })}
					>
						Back
					</Button>
				</>
			)}

			{state.matches({ capturePhase: "selectingCardsForPlayerCapture" }) && (
				<>
					<Button
						disabled={state.context.selectedEnemyCardIndex === null}
						onClick={() => {
							if (state.context.selectedEnemyCardIndex !== null) {
								send({
									type: "performPlayerCapture",
								});
							}
						}}
					>
						Confirm player capture
					</Button>
					<Button
						variant="outline"
						onClick={() => send({ type: "backToCaptureSelection" })}
					>
						Back
					</Button>
				</>
			)}

			{state.matches({ capturePhase: "selectingCardsForSacrifice" }) && (
				<>
					<Button
						disabled={
							state.context.selectedEnemyCardIndex === null ||
							state.context.selectedPlayerCardIndices.length < 2
						}
						onClick={() => {
							if (
								state.context.selectedEnemyCardIndex !== null &&
								state.context.selectedPlayerCardIndices.length >= 2
							) {
								send({
									type: "performSacrifice",
								});
							}
						}}
					>
						Confirm sacrifice
					</Button>
					<Button
						variant="outline"
						onClick={() => send({ type: "backToCaptureSelection" })}
					>
						Back
					</Button>
				</>
			)}

			{state.matches("lose") && (
				<div className="flex items-center gap-4">
					<div>You lost! 😢</div>
					<Button onClick={() => send({ type: "restartGame" })}>
						Try again
					</Button>
				</div>
			)}
			{state.matches("win") && <div>You won! 🥳</div>}
		</div>
	);
}
