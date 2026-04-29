import { createMachine } from "xstate";

export const SUIT = {
	HEARTS: "HEARTS",
	DIAMONDS: "DIAMONDS",
	CLUBS: "CLUBS",
	SPADES: "SPADES",
} as const;

export type Suit = (typeof SUIT)[keyof typeof SUIT];

export type Joker = {
	value: 0;
	suit: null;
};

export type Card =
	| {
			value: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
			suit: Suit;
	  }
	| Joker;

export type Slot = Card | null;

type GameContext = {
	playerSlots: Slot[];
	playerDeck: Card[];
	playerDiscardPile: Card[];
	enemySlots: Slot[];
	enemyDeck: Card[];
	enemyDiscardPile: Card[];
	gameEnd?: "win" | "lose";
};

const context: GameContext = {
	playerSlots: [null, null, null, null],
	playerDeck: [],
	playerDiscardPile: [],
	enemySlots: [null, null, null, null],
	enemyDeck: [],
	enemyDiscardPile: [],
};

export const gameMachine = createMachine({
	id: "gameMachine",
	context,
	initial: "setup",
	states: {
		setup: {
			entry: ["init"],
			on: { completeSetup: "enemyPhase" },
		},
		enemyPhase: {
			entry: ["compactEnemySlots", "refillEnemySlots"],
			on: { completeEnemyPhase: "discardPhase" },
		},
		discardPhase: {
			entry: ["performDiscard"],
			on: { completeDiscardPhase: "drawPhase" },
		},
		drawPhase: {
			on: { completeDrawPhase: "capturePhase" },
		},
		capturePhase: {
			on: {
				playerCapture: {
					actions: ["performPlayerCapture"],
				},
				enemyCapture: {
					actions: ["performEnemyCapture"],
				},
				sacrifice: {
					actions: ["performSacrifice"],
				},
				completeCapturePhase: {
					target: "enemyPhase",
					guard: "completeCapturePhaseGuard",
				},
			},
		},
	},
});
