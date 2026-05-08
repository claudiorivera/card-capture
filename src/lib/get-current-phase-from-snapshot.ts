import type { SnapshotFrom } from "xstate";
import type { gameMachine } from "#/lib/core/game-machine";

type Snapshot = SnapshotFrom<typeof gameMachine>;

export function getCurrentPhaseFromSnapshot(snapshot: Snapshot) {
	switch (true) {
		case snapshot.matches("setup"):
			return "Setup";
		case snapshot.matches("enemyPhase"):
			return "Enemy Phase";
		case snapshot.matches("discardPhase"):
			return "Discard Phase";
		case snapshot.matches("drawPhase"):
			return "Draw Phase";
		case snapshot.matches("capturePhase"):
			return "Capture Phase";
		case snapshot.matches("win"):
		case snapshot.matches("lose"):
			return "Game Over";
		default:
			return "Unknown Phase";
	}
}
