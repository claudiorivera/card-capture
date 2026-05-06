import { createBrowserInspector } from "@statelyai/inspect";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { createActor } from "xstate";
import { gameMachine } from "#/lib/core/game-machine";
import { routeTree } from "./routeTree.gen";

const { inspect } = createBrowserInspector();

const gameActor = createActor(gameMachine, {
	inspect,
}).start();

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		context: {
			gameActor,
		},
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
