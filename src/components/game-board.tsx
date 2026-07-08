import { RotateCcwIcon } from "lucide-react";
import { Controls } from "#/components/controls";
import { EnemyRow } from "#/components/enemy-row";
import { GamePhaseIndicator } from "#/components/game-phase-indicator";
import { PlayerRow } from "#/components/player-row";
import { Button } from "#/components/ui/button";
import { useGameStore } from "#/lib/core/game-store";

export function GameBoard() {
	const { restartGame } = useGameStore();

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between">
				<GamePhaseIndicator />
				<Button
					variant="destructive"
					onClick={restartGame}
					title="Restart game"
				>
					<RotateCcwIcon />
				</Button>
			</div>

			<EnemyRow />

			<PlayerRow />

			<Controls />
		</div>
	);
}
