import { create } from "zustand";
import { persist } from "zustand/middleware";
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

export type GamePhase = "discardPhase" | "capturePhase" | "win" | "lose";

type GameData = {
	phase: GamePhase;
	playerSlots: Slot[];
	playerDeck: PlayingCard[];
	playerDiscardPile: PlayingCard[];
	enemySlots: Slot[];
	enemyDeck: PlayingCard[];
	enemyDiscardPile: PlayingCard[];
	selectedPlayerCardIndices: number[];
	selectedEnemyCardIndex: number | null;
};

type GameActions = {
	togglePlayerCardSelection: (index: number) => void;
	toggleEnemySlotSelection: (index: number) => void;
	performPlayerDiscard: () => void;
	performPlayerCapture: () => void;
	performEnemyCapture: () => void;
	performSacrifice: () => void;
	restartGame: () => void;
};

export type GameStore = GameData & GameActions;

const initialData: GameData = {
	phase: "discardPhase",
	playerSlots: [null, null, null, null],
	playerDeck: [],
	playerDiscardPile: [],
	enemySlots: [null, null, null, null],
	enemyDeck: [],
	enemyDiscardPile: [],
	selectedPlayerCardIndices: [],
	selectedEnemyCardIndex: null,
};

function enterDrawPhase(data: GameData): GameData {
	const { deck, slots, discard } = drawCards({
		drawDeck: data.playerDeck,
		slots: data.playerSlots,
		discardPile: data.playerDiscardPile,
	});

	return {
		...data,
		phase: "capturePhase",
		playerDeck: deck,
		playerSlots: slots,
		playerDiscardPile: discard,
		selectedPlayerCardIndices: [],
		selectedEnemyCardIndex: null,
	};
}

function enterEnemyPhase(data: GameData): GameData {
	const compacted = compactSlots(data.enemySlots);

	const { updatedDeck, updatedSlots } = refillSlots({
		deck: data.enemyDeck,
		slots: compacted,
	});

	const refilled: GameData = {
		...data,
		enemySlots: updatedSlots,
		enemyDeck: updatedDeck,
	};

	if (refilled.playerSlots.every((slot) => slot === null)) {
		return enterDrawPhase(refilled);
	}

	return { ...refilled, phase: "discardPhase" };
}

function checkLoss(data: GameData): GameData {
	if (data.enemyDiscardPile.some(isElite)) {
		return { ...data, phase: "lose" };
	}

	return enterEnemyPhase(data);
}

function checkWinLoss(data: GameData): GameData {
	if (
		data.enemyDeck.length === 0 &&
		data.enemySlots.every((slot) => slot === null)
	) {
		return { ...data, phase: "win" };
	}

	return enterEnemyPhase(data);
}

function setupGame(): GameData {
	const { enemyDeck, playerDeck } = createDecks();

	const { updatedDeck: filledEnemyDeck, updatedSlots: filledEnemySlots } =
		refillSlots({
			deck: enemyDeck,
			slots: [null, null, null, null],
		});

	const eliteIndices = filledEnemySlots
		.map((slot, index) => (slot && isElite(slot) ? index : null))
		.filter((index): index is number => index !== null);

	const { deck: dismissedDeck, slots: dismissedSlots } =
		moveCardsToBottomOfDeck({
			deck: filledEnemyDeck,
			slots: filledEnemySlots,
			indicesToMove: eliteIndices,
		});

	return {
		...initialData,
		playerDeck,
		enemyDeck: dismissedDeck,
		enemySlots: dismissedSlots,
	};
}

export const useGameStore = create<GameStore>()(
	persist(
		(set) => ({
			...enterEnemyPhase(setupGame()),
			togglePlayerCardSelection: (index) =>
				set((state) => {
					const isSelected = state.selectedPlayerCardIndices.includes(index);

					return {
						selectedPlayerCardIndices: isSelected
							? state.selectedPlayerCardIndices.filter((i) => i !== index)
							: [...state.selectedPlayerCardIndices, index],
					};
				}),
			toggleEnemySlotSelection: (index) =>
				set((state) => ({
					selectedEnemyCardIndex:
						index === state.selectedEnemyCardIndex ? null : index,
				})),
			performPlayerDiscard: () =>
				set((state) => {
					const { slots, discardPile } = moveSlotsToDiscard({
						slots: state.playerSlots,
						slotsToDiscard: state.selectedPlayerCardIndices,
						discardPile: state.playerDiscardPile,
					});

					return enterDrawPhase({
						...state,
						playerSlots: slots,
						playerDiscardPile: discardPile,
						selectedPlayerCardIndices: [],
					});
				}),
			performPlayerCapture: () =>
				set((state) => {
					if (
						state.selectedEnemyCardIndex === null ||
						state.selectedPlayerCardIndices.length === 0
					) {
						return state;
					}

					const { enemySlots, playerDiscardPile, playerSlots } =
						performPlayerCapture({
							enemySlotIndex: state.selectedEnemyCardIndex,
							playerCardIndices: state.selectedPlayerCardIndices,
							enemySlots: state.enemySlots,
							playerDiscardPile: state.playerDiscardPile,
							playerSlots: state.playerSlots,
						});

					return checkWinLoss({
						...state,
						enemySlots,
						playerDiscardPile,
						playerSlots,
						selectedEnemyCardIndex: null,
						selectedPlayerCardIndices: [],
					});
				}),
			performEnemyCapture: () =>
				set((state) => {
					if (
						state.selectedPlayerCardIndices.length === 0 ||
						state.selectedPlayerCardIndices[0] === undefined
					) {
						return state;
					}

					const { enemyDiscardPile, enemySlots, playerSlots } =
						performEnemyCapture({
							enemyDiscardPile: state.enemyDiscardPile,
							enemySlots: state.enemySlots,
							playerDiscardPile: state.playerDiscardPile,
							playerSlots: state.playerSlots,
							playerSlotIndex: state.selectedPlayerCardIndices[0],
						});

					return checkLoss({
						...state,
						enemyDiscardPile,
						enemySlots,
						playerSlots,
						selectedEnemyCardIndex: null,
						selectedPlayerCardIndices: [],
					});
				}),
			performSacrifice: () =>
				set((state) => {
					if (
						state.selectedEnemyCardIndex === null ||
						state.selectedPlayerCardIndices.length < 2
					) {
						return state;
					}

					const {
						enemyDeck,
						enemyDiscardPile,
						enemySlots,
						playerDiscardPile,
						playerSlots,
					} = performSacrifice({
						playerCardIndices: state.selectedPlayerCardIndices,
						playerSlots: state.playerSlots,
						playerDiscardPile: state.playerDiscardPile,
						enemySlots: state.enemySlots,
						enemyDiscardPile: state.enemyDiscardPile,
						enemyDeck: state.enemyDeck,
						enemySlotIndex: state.selectedEnemyCardIndex,
					});

					return checkLoss({
						...state,
						enemyDeck,
						enemyDiscardPile,
						enemySlots,
						playerDiscardPile,
						playerSlots,
						selectedEnemyCardIndex: null,
						selectedPlayerCardIndices: [],
					});
				}),
			restartGame: () => set(() => enterEnemyPhase(setupGame())),
		}),
		{
			name: "card-capture-snapshot",
		},
	),
);
