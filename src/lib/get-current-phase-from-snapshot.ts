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
		case snapshot.matches({ capturePhase: "selectingCaptureAction" }):
			return "Capture Phase - Selecting Capture Action";
		case snapshot.matches({ capturePhase: "selectingPlayerCardsForSacrifice" }):
			return "Capture Phase - Selecting Player Cards for Sacrifice";
		case snapshot.matches({ capturePhase: "selectingEnemySlotForSacrifice" }):
			return "Capture Phase - Selecting Enemy Slot for Sacrifice";
		case snapshot.matches({ capturePhase: "performingSacrifice" }):
			return "Capture Phase - Performing Sacrifice";
		case snapshot.matches({
			capturePhase: "selectingPlayerCardForEnemyCapture",
		}):
			return "Capture Phase - Selecting Player Card for Enemy Capture";
		case snapshot.matches({ capturePhase: "performingEnemyCapture" }):
			return "Capture Phase - Performing Enemy Capture";
		case snapshot.matches({
			capturePhase: "selectingEnemySlotForPlayerCapture",
		}):
			return "Capture Phase - Selecting Enemy Slot for Player Capture";
		case snapshot.matches({
			capturePhase: "selectingPlayerCardsForPlayerCapture",
		}):
			return "Capture Phase - Selecting Player Cards for Player Capture";
		case snapshot.matches({ capturePhase: "invalidCapture" }):
			return "Capture Phase - Invalid Capture";
		case snapshot.matches({ capturePhase: "performingPlayerCapture" }):
			return "Capture Phase - Performing Player Capture";
		default:
			return "Unknown Phase";
	}
}
