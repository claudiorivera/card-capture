import { Button } from "#/components/ui/button";
import type { PlayingCard } from "#/lib/core/cards";
import { useGameStore } from "#/lib/core/game-store";
import { canPlayerCapture } from "#/lib/core/utils";

export function CaptureActions() {
	const {
		performEnemyCapture,
		performPlayerCapture,
		performSacrifice,
		selectedPlayerCardIndices,
		selectedEnemyCardIndex,
		enemySlots,
		playerSlots,
	} = useGameStore();

	const isPlayerCaptureEnabled =
		typeof selectedEnemyCardIndex === "number" &&
		typeof enemySlots[selectedEnemyCardIndex] !== "undefined" &&
		enemySlots[selectedEnemyCardIndex] !== null &&
		canPlayerCapture({
			playerCards: selectedPlayerCardIndices
				.map((index) => playerSlots.at(index))
				.filter((slot): slot is PlayingCard => typeof slot !== "undefined"),
			enemyCard: enemySlots[selectedEnemyCardIndex],
		});

	const isEnemyCaptureEnabled =
		selectedPlayerCardIndices.length === 1 && selectedEnemyCardIndex === 3;

	const isSacrificeEnabled =
		selectedPlayerCardIndices.length === 2 &&
		typeof selectedEnemyCardIndex === "number";

	return (
		<div className="flex gap-2">
			<Button onClick={performPlayerCapture} disabled={!isPlayerCaptureEnabled}>
				Player Capture
			</Button>
			<Button
				variant="destructive"
				onClick={performEnemyCapture}
				disabled={!isEnemyCaptureEnabled}
			>
				Enemy Capture
			</Button>
			<Button
				variant="destructive"
				onClick={performSacrifice}
				disabled={!isSacrificeEnabled}
			>
				Sacrifice
			</Button>
		</div>
	);
}
