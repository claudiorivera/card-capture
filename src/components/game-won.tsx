import { Button } from "#/components/ui/button";
import { useGameStore } from "#/lib/core/game-store";

export function GameWon() {
	const { restartGame } = useGameStore();

	return (
		<div className="flex items-center gap-4">
			<div>You won! 🥳</div>

			<Button onClick={restartGame}>Play again</Button>
		</div>
	);
}
