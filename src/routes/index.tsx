import { createFileRoute } from "@tanstack/react-router";
import { GameBoard } from "#/components/game-board";
import { ModeToggle } from "#/components/mode-toggle";

export const Route = createFileRoute("/")({ component: Home, ssr: false });

function Home() {
	return (
		<div className="p-4 flex flex-col gap-4">
			<div className="self-end">
				<ModeToggle />
			</div>
			<GameBoard />
		</div>
	);
}
