import { Button } from "#/components/ui/button";
import { useGameSend } from "#/lib/game-context";

export function PlayerCapturePlayerCardSelection({
	slots,
	enemySlot,
}: {
	slots: number[];
	enemySlot: number | undefined;
}) {
	const send = useGameSend();

	return (
		<Button
			disabled={enemySlot === undefined}
			onClick={() =>
				typeof enemySlot === "number"
					? send({
							type: "performPlayerCapture",
							playerCardIndices: slots,
							enemySlotIndex: enemySlot,
						})
					: null
			}
		>
			Complete capture with selected cards
		</Button>
	);
}
