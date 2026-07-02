import type { GamePhase } from "#/lib/core/game-store";

export function getPhaseLabel(phase: GamePhase): string {
	switch (phase) {
		case "discardPhase":
			return "Discard phase";
		case "capturePhase":
			return "Capture phase";
		case "win":
		case "lose":
			return "Game over";
		default:
			return "";
	}
}
