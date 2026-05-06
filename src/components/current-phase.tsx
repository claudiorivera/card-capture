import { useGameSnapshot } from "#/lib/game-context";
import { getCurrentPhaseFromSnapshot } from "#/lib/get-current-phase-from-snapshot";

export function CurrentPhase() {
	const snapshot = useGameSnapshot();

	const currentPhase = getCurrentPhaseFromSnapshot(snapshot);

	return <h2>{currentPhase}</h2>;
}
