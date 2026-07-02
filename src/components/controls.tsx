import { CaptureActions } from "#/components/capture-actions";
import { ConfirmDiscard } from "#/components/confirm-discard";
import { GameLost } from "#/components/game-lost";
import { GameWon } from "#/components/game-won";
import { useGameStore } from "#/lib/core/game-store";

export function Controls() {
	const { phase } = useGameStore();

	return (
		<>
			{phase === "lose" && <GameLost />}
			{phase === "win" && <GameWon />}
			{phase === "capturePhase" && <CaptureActions />}
			{phase === "discardPhase" && <ConfirmDiscard />}
		</>
	);
}
