import { Button } from "#/components/ui/button";
import { useGameSend } from "#/lib/game-context";

export function PlayerDiscardCardSelection({ slots }: { slots: number[] }) {
	const send = useGameSend();

	return (
		<Button
			onClick={() =>
				send({ type: "performPlayerDiscard", slotsToDiscard: slots })
			}
		>
			Discard selected cards
		</Button>
	);
}
