import { createFileRoute } from "@tanstack/react-router";
import { GameBoard } from "#/components/game-board";

export const Route = createFileRoute("/")({ component: Home, ssr: false });

function Home() {
	return (
		<div className="flex flex-col gap-4 p-4">
			<GameBoard />
		</div>
	);
}
