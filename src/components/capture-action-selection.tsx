import { Button } from "#/components/ui/button";
import { useGameSend } from "#/lib/game-context";

export function CaptureActionSelection() {
	const send = useGameSend();

	return (
		<div className="flex gap-4">
			<Button onClick={() => send({ type: "selectPlayerCaptureAction" })}>
				Player Capture
			</Button>

			<Button onClick={() => send({ type: "selectEnemyCaptureAction" })}>
				Enemy Capture
			</Button>

			<Button onClick={() => send({ type: "selectSacrificeAction" })}>
				Sacrifice
			</Button>
		</div>
	);
}
