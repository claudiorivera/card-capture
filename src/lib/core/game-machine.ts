import { assertEvent, emit, setup } from "xstate";
import {
	createDecks as _createDecks,
	type PlayingCard,
	type Slot,
} from "#/lib/core/cards";
import {
	canPlayerCapture as _canPlayerCapture,
	discardPlayerCards as _discardPlayerCards,
	drawPlayerCards as _drawPlayerCards,
	performEnemyCapture as _performEnemyCapture,
	performPlayerCapture as _performPlayerCapture,
	performSacrifice as _performSacrifice,
	compactSlots,
	isElite,
	moveCardsToBottomOfDeck,
	refillSlots,
} from "#/lib/core/utils";

type GameContext = {
	playerSlots: Slot[];
	playerDeck: PlayingCard[];
	playerDiscardPile: PlayingCard[];
	enemySlots: Slot[];
	enemyDeck: PlayingCard[];
	enemyDiscardPile: PlayingCard[];
};

const context: GameContext = {
	playerSlots: [null, null, null, null],
	playerDeck: [],
	playerDiscardPile: [],
	enemySlots: [null, null, null, null],
	enemyDeck: [],
	enemyDiscardPile: [],
};

const gameMachineSetup = setup({
	types: {
		context,
		events: {} as
			| { type: "selectPlayerCardsForDiscard"; slotsToDiscard: number[] }
			| { type: "performPlayerDiscard"; slotsToDiscard: number[] }
			| { type: "selectPlayerCaptureAction" }
			| { type: "selectEnemySlotForPlayerCapture"; enemySlotIndex: number }
			| {
					type: "selectPlayerCardsForPlayerCapture";
					playerCardIndices: number[];
			  }
			| {
					type: "performPlayerCapture";
					enemySlotIndex: number;
					playerCardIndices: number[];
			  }
			| { type: "selectEnemyCaptureAction" }
			| { type: "selectPlayerCardForEnemyCapture"; playerSlotIndex: number }
			| { type: "performEnemyCapture"; playerSlotIndex: number }
			| { type: "selectSacrificeAction" }
			| {
					type: "selectPlayerCardsForSacrifice";
					playerCardIndices: number[];
			  }
			| {
					type: "selectEnemySlotForSacrifice";
					enemySlotIndex: number;
			  }
			| {
					type: "performSacrifice";
					enemySlotIndex: number;
					playerCardIndices: number[];
			  },
		emitted: {} as { type: "captureInvalid"; reason: string },
	},
	guards: {
		checkForLoss: ({ context }) => context.enemyDiscardPile.some(isElite),
		checkForWin: ({ context }) =>
			context.enemyDeck.length === 0 &&
			context.enemySlots.every((slot) => slot === null),
		checkForValidPlayerCapture: ({ context, event }) => {
			assertEvent(event, "performPlayerCapture");

			const enemyCard = context.enemySlots.at(event.enemySlotIndex);

			if (!enemyCard) return false;

			const playerCards = event.playerCardIndices
				.map((index) => context.playerSlots.at(index))
				.filter((card): card is PlayingCard => card !== null);

			return (
				playerCards.length === event.playerCardIndices.length &&
				_canPlayerCapture({
					enemyCard,
					playerCards,
				})
			);
		},
	},
	actions: {
		emitCaptureInvalid: emit({
			type: "captureInvalid",
			reason: "Invalid card selection for capture",
		}),
	},
});

const createDecks = gameMachineSetup.assign(() => {
	const { enemyDeck, playerDeck } = _createDecks();

	return {
		enemyDeck,
		playerDeck,
	};
});

const dealInitialEnemyCards = gameMachineSetup.assign(({ context }) => {
	const { updatedSlots, updatedDeck } = refillSlots({
		slots: context.enemySlots,
		deck: context.enemyDeck,
	});

	return {
		enemySlots: updatedSlots,
		enemyDeck: updatedDeck,
	};
});

const dismissEliteCardsFromEnemySlots = gameMachineSetup.assign(
	({ context }) => {
		const eliteCardEnemySlotIndices = context.enemySlots
			.map((slot, index) => (slot && isElite(slot) ? index : null))
			.filter((index): index is number => index !== null);

		const { deck, slots } = moveCardsToBottomOfDeck({
			deck: context.enemyDeck,
			slots: context.enemySlots,
			indicesToMove: eliteCardEnemySlotIndices,
		});

		return {
			enemyDeck: deck,
			enemySlots: slots,
		};
	},
);

const compactEnemySlots = gameMachineSetup.assign(({ context }) => ({
	enemySlots: compactSlots(context.enemySlots),
}));

const refillEnemySlots = gameMachineSetup.assign(({ context }) => {
	const { updatedDeck, updatedSlots } = refillSlots({
		deck: context.enemyDeck,
		slots: context.enemySlots,
	});

	return {
		enemyDeck: updatedDeck,
		enemySlots: updatedSlots,
	};
});

const drawPlayerCards = gameMachineSetup.assign(({ context }) => {
	const { deck, slots, discard } = _drawPlayerCards({
		playerDeck: context.playerDeck,
		playerSlots: context.playerSlots,
		playerDiscardPile: context.playerDiscardPile,
	});

	return {
		playerDeck: deck,
		playerSlots: slots,
		playerDiscardPile: discard,
	};
});

const performPlayerDiscard = gameMachineSetup.assign(({ context, event }) => {
	assertEvent(event, "performPlayerDiscard");

	const { playerSlots, discardPile } = _discardPlayerCards({
		playerSlots: context.playerSlots,
		slotsToDiscard: event.slotsToDiscard,
		discardPile: context.playerDiscardPile,
	});

	return {
		playerSlots,
		playerDiscardPile: discardPile,
	};
});

const performPlayerCapture = gameMachineSetup.assign(({ context, event }) => {
	assertEvent(event, "performPlayerCapture");

	const { enemySlots, playerSlots, playerDiscardPile } = _performPlayerCapture({
		enemySlots: context.enemySlots,
		enemySlotIndex: event.enemySlotIndex,
		playerSlots: context.playerSlots,
		playerCardIndices: event.playerCardIndices,
		playerDiscardPile: context.playerDiscardPile,
	});

	return {
		enemySlots,
		playerSlots,
		playerDiscardPile,
	};
});

const performEnemyCapture = gameMachineSetup.assign(({ context, event }) => {
	assertEvent(event, "performEnemyCapture");

	const { playerSlots, enemySlots, enemyDiscardPile, playerDiscardPile } =
		_performEnemyCapture({
			playerSlots: context.playerSlots,
			enemySlots: context.enemySlots,
			enemyDiscardPile: context.enemyDiscardPile,
			playerDiscardPile: context.playerDiscardPile,
			playerSlotIndex: event.playerSlotIndex,
		});

	return {
		playerSlots,
		enemySlots,
		enemyDiscardPile,
		playerDiscardPile,
	};
});

const performSacrifice = gameMachineSetup.assign(({ context, event }) => {
	assertEvent(event, "performSacrifice");

	const { playerSlots, enemySlots, enemyDeck, enemyDiscardPile } =
		_performSacrifice({
			playerSlots: context.playerSlots,
			enemySlots: context.enemySlots,
			enemyDeck: context.enemyDeck,
			enemySlotIndex: event.enemySlotIndex,
			enemyDiscardPile: context.enemyDiscardPile,
			playerDiscardPile: context.playerDiscardPile,
			playerCardIndices: event.playerCardIndices,
		});

	return {
		playerSlots,
		enemySlots,
		enemyDeck,
		enemyDiscardPile,
	};
});

export const gameMachine = gameMachineSetup.createMachine({
	id: "game",
	context,
	initial: "setup",
	states: {
		setup: {
			initial: "creatingDecks",
			states: {
				creatingDecks: {
					entry: createDecks,
					always: {
						target: "dealingInitialEnemyCards",
					},
				},
				dealingInitialEnemyCards: {
					entry: dealInitialEnemyCards,
					always: {
						target: "dismissEliteCardsFromEnemySlots",
					},
				},
				dismissEliteCardsFromEnemySlots: {
					entry: dismissEliteCardsFromEnemySlots,
					always: {
						target: "#game.enemyPhase",
					},
				},
			},
		},
		enemyPhase: {
			entry: [compactEnemySlots, refillEnemySlots],
			always: {
				target: "discardPhase",
			},
		},
		discardPhase: {
			initial: "selectingCards",
			states: {
				selectingCards: {
					on: {
						selectPlayerCardsForDiscard: {
							target: "performingPlayerDiscard",
						},
					},
				},
				performingPlayerDiscard: {
					on: {
						performPlayerDiscard: {
							actions: performPlayerDiscard,
							target: "#game.drawPhase",
						},
					},
				},
			},
		},
		drawPhase: {
			entry: drawPlayerCards,
			always: {
				target: "capturePhase",
			},
		},
		capturePhase: {
			initial: "selectingCaptureAction",
			states: {
				selectingCaptureAction: {
					on: {
						selectEnemyCaptureAction: {
							target: "selectingPlayerCardForEnemyCapture",
						},
						selectPlayerCaptureAction: {
							target: "selectingEnemySlotForPlayerCapture",
						},
						selectSacrificeAction: {
							target: "selectingPlayerCardsForSacrifice",
						},
					},
				},
				selectingPlayerCardForEnemyCapture: {
					on: {
						performEnemyCapture: {
							actions: performEnemyCapture,
							target: "performingEnemyCapture",
						},
					},
				},
				performingEnemyCapture: {
					always: [
						{
							target: "lost",
							guard: {
								type: "checkForLoss",
							},
						},
						{
							target: "#game.enemyPhase",
						},
					],
				},
				selectingEnemySlotForPlayerCapture: {
					on: {
						selectEnemySlotForPlayerCapture: {
							target: "selectingPlayerCardsForPlayerCapture",
						},
					},
				},
				selectingPlayerCardsForPlayerCapture: {
					on: {
						performPlayerCapture: [
							{
								guard: { type: "checkForValidPlayerCapture" },
								actions: performPlayerCapture,
								target: "performingPlayerCapture",
							},
							{
								target: "invalidCapture",
							},
						],
					},
				},
				performingPlayerCapture: {
					always: [
						{
							target: "checkingForWin",
						},
					],
				},
				invalidCapture: {
					entry: { type: "emitCaptureInvalid" },
					always: {
						target: "selectingEnemySlotForPlayerCapture",
					},
				},
				selectingPlayerCardsForSacrifice: {
					on: {
						selectPlayerCardsForSacrifice: {
							target: "selectingEnemySlotForSacrifice",
						},
					},
				},
				selectingEnemySlotForSacrifice: {
					on: {
						performSacrifice: {
							actions: performSacrifice,
							target: "performingSacrifice",
						},
					},
				},
				performingSacrifice: {
					always: [
						{
							target: "lost",
							guard: {
								type: "checkForLoss",
							},
						},
						{
							target: "#game.enemyPhase",
						},
					],
				},
				checkingForWin: {
					always: [
						{
							target: "won",
							guard: {
								type: "checkForWin",
							},
						},
						{
							target: "#game.enemyPhase",
						},
					],
				},
				won: {
					type: "final",
				},
				lost: {
					type: "final",
				},
			},
		},
	},
});
