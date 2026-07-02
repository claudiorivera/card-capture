import { useGameStore } from "#/lib/core/game-store";
import { getPhaseLabel } from "#/lib/label-maps";

export function GamePhaseIndicator() {
	const { phase } = useGameStore();

	return <h1 className="font-bold md:text-2xl">{getPhaseLabel(phase)}</h1>;
}
