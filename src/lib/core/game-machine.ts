import { assign, setup } from "xstate";
import { createDecks, type PlayingCard, type Slot } from "#/lib/core/cards";
import {
	compactSlots,
	drawCards,
	isElite,
	moveCardsToBottomOfDeck,
	moveSlotsToDiscard,
	performEnemyCapture,
	performPlayerCapture,
	performSacrifice,
	refillSlots,
} from "#/lib/core/utils";

export type GameContext = {
	playerSlots: Slot[];
	playerDeck: PlayingCard[];
	playerDiscardPile: PlayingCard[];
	enemySlots: Slot[];
	enemyDeck: PlayingCard[];
	enemyDiscardPile: PlayingCard[];
	selectedPlayerCardIndices: number[];
	selectedEnemyCardIndex: number | null;
};

const context: GameContext = {
	playerSlots: [null, null, null, null],
	playerDeck: [],
	playerDiscardPile: [],
	enemySlots: [null, null, null, null],
	enemyDeck: [],
	enemyDiscardPile: [],
	selectedPlayerCardIndices: [],
	selectedEnemyCardIndex: null,
};

const gameMachineSetup = setup({
	types: {
		context,
		events: {} as
			| { type: "togglePlayerCardSelection"; index: number }
			| { type: "performPlayerDiscard" }
			| { type: "selectEnemyCaptureAction" }
			| { type: "selectPlayerCaptureAction" }
			| { type: "selectSacrificeAction" }
			| { type: "performEnemyCapture" }
			| { type: "toggleEnemySlotSelection"; index: number }
			| { type: "performPlayerCapture" }
			| { type: "performSacrifice" },
	},
	guards: {
		didLose: ({ context }) => context.enemyDiscardPile.some(isElite),
		didWin: ({ context }) =>
			context.enemyDeck.length === 0 &&
			context.enemySlots.every((slot) => slot === null),
	},
	actions: {
		createDecks: assign(() => {
			const { enemyDeck, playerDeck } = createDecks();

			return {
				enemyDeck,
				playerDeck,
			};
		}),
		refillEnemySlots: assign(({ context }) => {
			const { updatedDeck, updatedSlots } = refillSlots({
				deck: context.enemyDeck,
				slots: context.enemySlots,
			});

			return {
				enemyDeck: updatedDeck,
				enemySlots: updatedSlots,
			};
		}),
		dismissEliteCardsInEnemySlots: assign(({ context }) => {
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
		}),
		compactEnemySlots: assign(({ context }) => ({
			enemySlots: compactSlots(context.enemySlots),
		})),
		performPlayerDiscard: assign(({ context }) => {
			const { slots, discardPile } = moveSlotsToDiscard({
				slots: context.playerSlots,
				slotsToDiscard: context.selectedPlayerCardIndices,
				discardPile: context.playerDiscardPile,
			});

			return {
				playerSlots: slots,
				playerDiscardPile: discardPile,
				selectedPlayerCardIndices: [],
			};
		}),
		refillPlayerSlots: assign(({ context }) => {
			const { deck, slots, discard } = drawCards({
				drawDeck: context.playerDeck,
				slots: context.playerSlots,
				discardPile: context.playerDiscardPile,
			});

			return {
				playerDeck: deck,
				playerSlots: slots,
				playerDiscardPile: discard,
			};
		}),
		performEnemyCapture: assign(({ context }) => {
			if (!context.selectedPlayerCardIndices[0]) {
				throw new Error("No player card selected for enemy capture");
			}

			const { enemyDiscardPile, enemySlots, playerSlots } = performEnemyCapture(
				{
					enemyDiscardPile: context.enemyDiscardPile,
					enemySlots: context.enemySlots,
					playerDiscardPile: context.playerDiscardPile,
					playerSlots: context.playerSlots,
					playerSlotIndex: context.selectedPlayerCardIndices[0],
				},
			);

			return {
				enemyDiscardPile,
				enemySlots,
				playerSlots,
				selectedPlayerCardIndices: [],
			};
		}),
		performPlayerCapture: assign(({ context }) => {
			if (!context.selectedEnemyCardIndex) {
				throw new Error("No enemy slot selected for player capture");
			}

			const { enemySlots, playerDiscardPile, playerSlots } =
				performPlayerCapture({
					enemySlotIndex: context.selectedEnemyCardIndex,
					playerCardIndices: context.selectedPlayerCardIndices,
					enemySlots: context.enemySlots,
					playerDiscardPile: context.playerDiscardPile,
					playerSlots: context.playerSlots,
				});

			return {
				enemySlots,
				playerDiscardPile,
				playerSlots,
				selectedEnemyCardIndex: null,
				selectedPlayerCardIndices: [],
			};
		}),
		performSacrifice: assign(({ context }) => {
			if (!context.selectedEnemyCardIndex) {
				throw new Error("No enemy slot selected for sacrifice action");
			}

			const {
				enemyDeck,
				enemyDiscardPile,
				enemySlots,
				playerDiscardPile,
				playerSlots,
			} = performSacrifice({
				playerCardIndices: context.selectedPlayerCardIndices,
				playerSlots: context.playerSlots,
				playerDiscardPile: context.playerDiscardPile,
				enemySlots: context.enemySlots,
				enemyDiscardPile: context.enemyDiscardPile,
				enemyDeck: context.enemyDeck,
				enemySlotIndex: context.selectedEnemyCardIndex,
			});

			return {
				enemyDeck,
				enemyDiscardPile,
				enemySlots,
				playerDiscardPile,
				playerSlots,
				selectedEnemyCardIndex: null,
				selectedPlayerCardIndices: [],
			};
		}),
	},
});

export const gameMachine = gameMachineSetup.createMachine({
	id: "game",
	context,
	initial: "setup",
	states: {
		setup: {
			entry: [
				{ type: "createDecks" },
				{ type: "refillEnemySlots" },
				{ type: "dismissEliteCardsInEnemySlots" },
			],
			always: {
				target: "enemyPhase",
			},
		},
		enemyPhase: {
			entry: [{ type: "compactEnemySlots" }, { type: "refillEnemySlots" }],
			always: {
				target: "discardPhase",
			},
		},
		discardPhase: {
			on: {
				togglePlayerCardSelection: {
					actions: assign(({ context, event }) => {
						const isSelected = context.selectedPlayerCardIndices.includes(
							event.index,
						);

						return {
							selectedPlayerCardIndices: isSelected
								? context.selectedPlayerCardIndices.filter(
										(index) => index !== event.index,
									)
								: [...context.selectedPlayerCardIndices, event.index],
						};
					}),
				},
				performPlayerDiscard: {
					actions: { type: "performPlayerDiscard" },
					target: "#game.drawPhase",
				},
			},
		},
		drawPhase: {
			entry: { type: "refillPlayerSlots" },
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
							target: "selectingCardsForPlayerCapture",
						},
						selectSacrificeAction: {
							target: "selectingCardsForSacrifice",
						},
					},
				},
				selectingPlayerCardForEnemyCapture: {
					on: {
						togglePlayerCardSelection: {
							actions: assign(({ event }) => {
								return {
									selectedPlayerCardIndices:
										event.index !== null ? [event.index] : [],
								};
							}),
						},
						performEnemyCapture: {
							actions: { type: "performEnemyCapture" },
							target: "#game.checkEnemyCaptureResult",
						},
					},
				},
				selectingCardsForPlayerCapture: {
					on: {
						toggleEnemySlotSelection: {
							actions: assign(({ context, event }) => {
								return {
									selectedEnemyCardIndex:
										event.index === context.selectedEnemyCardIndex
											? null
											: event.index,
								};
							}),
						},
						togglePlayerCardSelection: {
							actions: assign(({ context, event }) => {
								const isSelected = context.selectedPlayerCardIndices.includes(
									event.index,
								);

								return {
									selectedPlayerCardIndices: isSelected
										? context.selectedPlayerCardIndices.filter(
												(index) => index !== event.index,
											)
										: [...context.selectedPlayerCardIndices, event.index],
								};
							}),
						},
						performPlayerCapture: {
							actions: { type: "performPlayerCapture" },
							target: "#game.checkPlayerCaptureResult",
						},
					},
				},
				selectingCardsForSacrifice: {
					on: {
						togglePlayerCardSelection: {
							actions: assign(({ context, event }) => {
								const isSelected = context.selectedPlayerCardIndices.includes(
									event.index,
								);

								return {
									selectedPlayerCardIndices: isSelected
										? context.selectedPlayerCardIndices.filter(
												(index) => index !== event.index,
											)
										: [...context.selectedPlayerCardIndices, event.index].slice(
												-2,
											),
								};
							}),
						},
						toggleEnemySlotSelection: {
							actions: assign(({ event, context }) => {
								return {
									selectedEnemyCardIndex:
										event.index === context.selectedEnemyCardIndex
											? null
											: event.index,
								};
							}),
						},
						performSacrifice: [
							{
								actions: { type: "performSacrifice" },
								target: "#game.checkSacrificeResult",
							},
						],
					},
				},
			},
		},
		checkEnemyCaptureResult: {
			always: [
				{
					guard: { type: "didLose" },
					target: "#game.lose",
				},
				{
					target: "#game.enemyPhase",
				},
			],
		},
		checkPlayerCaptureResult: {
			always: [
				{
					guard: { type: "didWin" },
					target: "#game.win",
				},
				{
					target: "#game.enemyPhase",
				},
			],
		},
		checkSacrificeResult: {
			always: [
				{
					guard: { type: "didLose" },
					target: "#game.lose",
				},
				{
					target: "#game.enemyPhase",
				},
			],
		},
		win: {
			type: "final",
		},
		lose: {
			type: "final",
		},
	},
});
