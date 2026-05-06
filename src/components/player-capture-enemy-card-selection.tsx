import { Button } from "#/components/ui/button";
import { useGameSend } from "#/lib/game-context";

export function PlayerCaptureEnemyCardSelection({
	slot,
}: {
	slot: number | undefined;
}) {
	const send = useGameSend();

	return (
		<div>
			<Button
				disabled={slot === undefined}
				onClick={() =>
					typeof slot === "number"
						? send({
								type: "selectEnemySlotForPlayerCapture",
								enemySlotIndex: slot,
							})
						: null
				}
			>
				Confirm enemy card selection
			</Button>
		</div>
	);
}
