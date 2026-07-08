import { Button } from "#/components/ui/button";
import { useGameStore } from "#/lib/core/game-store";

export function ConfirmDiscard() {
	const { performPlayerDiscard } = useGameStore();

	return <Button onClick={performPlayerDiscard}>Confirm discard</Button>;
}
