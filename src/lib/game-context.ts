import { useRouteContext } from "@tanstack/react-router";
import { useSelector } from "@xstate/react";
import type { ActorRefFrom } from "xstate";
import type { gameMachine } from "./core/game-machine";

export type GameActor = ActorRefFrom<typeof gameMachine>;

export type RootContext = {
	gameActor: GameActor;
};

export function useGameActor(): GameActor {
	const { gameActor } = useRouteContext({ from: "__root__" });
	return gameActor;
}

export function useGameSnapshot() {
	const gameActor = useGameActor();
	return useSelector(gameActor, (snapshot) => snapshot);
}

export function useGameState() {
	const gameActor = useGameActor();
	return useSelector(gameActor, (snapshot) => snapshot.value);
}

export function useGameContext() {
	const gameActor = useGameActor();
	return useSelector(gameActor, (snapshot) => snapshot.context);
}

export function useGameSend() {
	const gameActor = useGameActor();
	return gameActor.send;
}
