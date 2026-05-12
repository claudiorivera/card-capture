import { describe, expect, it } from "vitest";
import { type PlayingCard, type Slot, SUIT } from "#/lib/core/cards";
import {
	canPlayerCapture,
	compactSlots,
	drawCards,
	getHighestEligibleEnemySlotIndexForPlayerCapture,
	moveCardsToBottomOfDeck,
	moveSlotsToDiscard,
	refillSlots,
} from "./utils";

const createCard = (
	id: string,
	value: Exclude<PlayingCard["value"], 0>,
	suit: Exclude<PlayingCard["suit"], null>,
): PlayingCard => ({ id, value, suit });

const createJoker = (id: string): PlayingCard => ({ id, value: 0, suit: null });

describe(compactSlots.name, () => {
	it("should move all cards to the right and fill with null", () => {
		const slots: Slot[] = [
			null,
			createCard("compact-1", 5, SUIT.HEARTS),
			null,
			createCard("compact-2", 10, SUIT.DIAMONDS),
		];

		expect(compactSlots(slots)).toEqual([
			null,
			null,
			createCard("compact-1", 5, SUIT.HEARTS),
			createCard("compact-2", 10, SUIT.DIAMONDS),
		]);
	});

	it("should leave an already compact array unchanged", () => {
		const slots: Slot[] = [
			null,
			null,
			createCard("compact-3", 2, SUIT.CLUBS),
			createCard("compact-4", 3, SUIT.SPADES),
		];
		expect(compactSlots(slots)).toEqual(slots);
	});
});

describe(refillSlots.name, () => {
	it("should refill empty slots from the deck (right to left)", () => {
		const slots: Slot[] = [null, null, null, null];
		const deck: PlayingCard[] = [
			createCard("refill-1", 7, SUIT.HEARTS),
			createCard("refill-2", 8, SUIT.DIAMONDS),
		];
		const { updatedSlots, updatedDeck } = refillSlots({ slots, deck });
		expect(updatedSlots).toEqual([
			null,
			null,
			createCard("refill-2", 8, SUIT.DIAMONDS),
			createCard("refill-1", 7, SUIT.HEARTS),
		]);
		expect(updatedDeck).toEqual([]);
	});

	it("should leave remaining slots unfilled if the deck is empty", () => {
		const slots: Slot[] = [null, null, null, null];
		const deck: PlayingCard[] = [createCard("refill-3", 9, SUIT.SPADES)];
		const { updatedSlots, updatedDeck } = refillSlots({ slots, deck });
		expect(updatedSlots).toEqual([
			null,
			null,
			null,
			createCard("refill-3", 9, SUIT.SPADES),
		]);
		expect(updatedDeck).toEqual([]);
	});

	it("should leave filled slots unchanged", () => {
		const slots: Slot[] = [
			null,
			createCard("refill-4", 4, SUIT.CLUBS),
			null,
			null,
		];
		const deck: PlayingCard[] = [createCard("refill-5", 2, SUIT.DIAMONDS)];
		const { updatedSlots, updatedDeck } = refillSlots({ slots, deck });
		expect(updatedSlots).toEqual([
			null,
			createCard("refill-4", 4, SUIT.CLUBS),
			null,
			createCard("refill-5", 2, SUIT.DIAMONDS),
		]);
		expect(updatedDeck).toEqual([]);
	});
});

describe(moveSlotsToDiscard.name, () => {
	it("should discard specified slots", () => {
		const result = moveSlotsToDiscard({
			discardPile: [],
			slots: [createCard("discard-1", 5, SUIT.HEARTS), null, null, null],
			slotsToDiscard: [0],
		});

		expect(result).toEqual({
			discardPile: [createCard("discard-1", 5, SUIT.HEARTS)],
			slots: [null, null, null, null],
		});
	});
});

describe(drawCards.name, () => {
	describe("moveCardsToBottomOfDeck", () => {
		const aceHearts = createCard("move-1", 14, SUIT.HEARTS);
		const tenDiamonds = createCard("move-2", 10, SUIT.DIAMONDS);
		const fiveClubs = createCard("move-3", 5, SUIT.CLUBS);
		const joker = createJoker("move-4");

		it("moves a single card to the bottom of the deck", () => {
			const slots = [aceHearts, null, fiveClubs, null];
			const deck = [tenDiamonds];
			const result = moveCardsToBottomOfDeck({
				slots,
				deck,
				indicesToMove: [0],
			});
			expect(result.slots).toEqual([null, null, fiveClubs, null]);
			expect(result.deck).toEqual([tenDiamonds, aceHearts]);
		});

		it("moves multiple cards (in order) to the bottom of the deck", () => {
			const slots = [aceHearts, fiveClubs, null, tenDiamonds];
			const deck: PlayingCard[] = [];
			const result = moveCardsToBottomOfDeck({
				slots,
				deck,
				indicesToMove: [3, 0],
			});
			expect(result.slots).toEqual([null, fiveClubs, null, null]);
			expect(result.deck).toEqual([tenDiamonds, aceHearts]);
		});

		it("ignores indices that are null in slots", () => {
			const slots = [null, aceHearts, tenDiamonds, null];
			const deck: PlayingCard[] = [fiveClubs];
			const result = moveCardsToBottomOfDeck({
				slots,
				deck,
				indicesToMove: [0, 1, 3],
			});
			expect(result.slots).toEqual([null, null, tenDiamonds, null]);
			expect(result.deck).toEqual([fiveClubs, aceHearts]);
		});

		it("handles duplicate indices (still only moves each card once)", () => {
			const slots = [aceHearts, fiveClubs, joker, tenDiamonds];
			const deck: PlayingCard[] = [];
			const result = moveCardsToBottomOfDeck({
				slots,
				deck,
				indicesToMove: [1, 1, 3],
			});
			expect(result.slots).toEqual([aceHearts, null, joker, null]);
			expect(result.deck).toEqual([fiveClubs, tenDiamonds]);
		});

		it("does nothing if indicesToMove is empty", () => {
			const slots = [aceHearts, fiveClubs, tenDiamonds];
			const deck: PlayingCard[] = [joker];
			const result = moveCardsToBottomOfDeck({
				slots,
				deck,
				indicesToMove: [],
			});
			expect(result.slots).toEqual(slots);
			expect(result.deck).toEqual([joker]);
		});

		it("ignores out-of-bounds indices", () => {
			const slots = [aceHearts, fiveClubs];
			const deck: PlayingCard[] = [tenDiamonds];
			const result = moveCardsToBottomOfDeck({
				slots,
				deck,
				indicesToMove: [0, 5],
			});
			expect(result.slots).toEqual([null, fiveClubs]);
			expect(result.deck).toEqual([tenDiamonds, aceHearts]);
		});

		it("works when deck is empty", () => {
			const slots = [joker, null, aceHearts];
			const deck: PlayingCard[] = [];
			const result = moveCardsToBottomOfDeck({
				slots,
				deck,
				indicesToMove: [0, 2],
			});
			expect(result.slots).toEqual([null, null, null]);
			expect(result.deck).toEqual([joker, aceHearts]);
		});

		it("does nothing if all slots are null", () => {
			const slots = [null, null];
			const deck: PlayingCard[] = [joker];
			const result = moveCardsToBottomOfDeck({
				slots,
				deck,
				indicesToMove: [0, 1],
			});
			expect(result.slots).toEqual([null, null]);
			expect(result.deck).toEqual([joker]);
		});

		it("moves all cards if all indices are included", () => {
			const slots = [fiveClubs, joker];
			const deck: PlayingCard[] = [aceHearts];
			const result = moveCardsToBottomOfDeck({
				slots,
				deck,
				indicesToMove: [0, 1],
			});
			expect(result.slots).toEqual([null, null]);
			expect(result.deck).toEqual([aceHearts, fiveClubs, joker]);
		});
	});

	it("should fill empty player slots from the deck", () => {
		const result = drawCards({
			slots: [null, null, null, null],
			drawDeck: [
				createCard("draw-1", 6, SUIT.HEARTS),
				createCard("draw-2", 7, SUIT.DIAMONDS),
			],
			discardPile: [],
		});

		expect(result.slots).toEqual([
			null,
			null,
			createCard("draw-2", 7, SUIT.DIAMONDS),
			createCard("draw-1", 6, SUIT.HEARTS),
		]);
		expect(result.deck).toEqual([]);
		expect(result.discard).toEqual([]);
	});

	it("should reshuffle discard pile into deck when the deck is empty", () => {
		const result = drawCards({
			slots: [null, null, null, null],
			drawDeck: [],
			discardPile: [
				createCard("draw-3", 5, SUIT.CLUBS),
				createCard("draw-4", 8, SUIT.SPADES),
			],
		});

		expect(result.slots.filter(Boolean).length).toBe(2);
		expect(result.deck).toEqual([]);
		expect(result.discard).toEqual([]);
	});

	it("should refill remaining slots after reshuffling discard pile when deck is exhausted mid-refill", () => {
		const result = drawCards({
			slots: [null, null, null, null],
			drawDeck: [createCard("draw-5", 6, SUIT.HEARTS)],
			discardPile: [
				createCard("draw-6", 7, SUIT.DIAMONDS),
				createCard("draw-7", 8, SUIT.CLUBS),
				createCard("draw-8", 9, SUIT.SPADES),
			],
		});

		expect(result.slots.filter(Boolean).length).toBe(4);
		expect(result.deck).toEqual([]);
		expect(result.discard).toEqual([]);
	});

	it("should handle empty deck and discard pile", () => {
		const result = drawCards({
			slots: [null, null, createCard("draw-9", 3, SUIT.HEARTS), null],
			drawDeck: [],
			discardPile: [],
		});

		expect(result.slots).toEqual([
			null,
			null,
			createCard("draw-9", 3, SUIT.HEARTS),
			null,
		]);
		expect(result.deck).toEqual([]);
		expect(result.discard).toEqual([]);
	});
});

describe(canPlayerCapture.name, () => {
	it("returns false when enemy card has no suit (joker)", () => {
		const result = canPlayerCapture({
			playerCards: [createCard("p1", 5, SUIT.HEARTS)],
			enemyCard: createJoker("e1"),
		});

		expect(result).toBe(false);
	});

	it("returns false when no player cards are selected", () => {
		const result = canPlayerCapture({
			playerCards: [],
			enemyCard: createCard("e1", 5, SUIT.HEARTS),
		});

		expect(result).toBe(false);
	});

	it("returns false when only jokers are selected", () => {
		const result = canPlayerCapture({
			playerCards: [createJoker("p1"), createJoker("p2")],
			enemyCard: createCard("e1", 5, SUIT.HEARTS),
		});

		expect(result).toBe(false);
	});

	it("returns false when player cards have mixed suits", () => {
		const result = canPlayerCapture({
			playerCards: [
				createCard("p1", 3, SUIT.HEARTS),
				createCard("p2", 2, SUIT.CLUBS),
			],
			enemyCard: createCard("e1", 4, SUIT.HEARTS),
		});

		expect(result).toBe(false);
	});

	it("returns false when player card suit does not match enemy suit", () => {
		const result = canPlayerCapture({
			playerCards: [createCard("p1", 5, SUIT.HEARTS)],
			enemyCard: createCard("e1", 4, SUIT.CLUBS),
		});

		expect(result).toBe(false);
	});

	it("returns false when sum of player cards is less than enemy card value", () => {
		const result = canPlayerCapture({
			playerCards: [
				createCard("p1", 3, SUIT.HEARTS),
				createCard("p2", 2, SUIT.HEARTS),
			],
			enemyCard: createCard("e1", 6, SUIT.HEARTS),
		});

		expect(result).toBe(false);
	});

	it("returns true when player card values sum exactly equals enemy card value", () => {
		const result = canPlayerCapture({
			playerCards: [
				createCard("p1", 3, SUIT.HEARTS),
				createCard("p2", 2, SUIT.HEARTS),
			],
			enemyCard: createCard("e1", 5, SUIT.HEARTS),
		});

		expect(result).toBe(true);
	});

	it("returns true when player card values sum exceeds enemy card value", () => {
		const result = canPlayerCapture({
			playerCards: [
				createCard("p1", 5, SUIT.HEARTS),
				createCard("p2", 4, SUIT.HEARTS),
			],
			enemyCard: createCard("e1", 7, SUIT.HEARTS),
		});

		expect(result).toBe(true);
	});

	it("uses highest non-joker card value for joker calculation", () => {
		const result = canPlayerCapture({
			playerCards: [
				createCard("p1", 5, SUIT.SPADES),
				createCard("p2", 3, SUIT.SPADES),
				createJoker("p3"),
			],
			enemyCard: createCard("e1", 13, SUIT.SPADES),
		});

		expect(result).toBe(true);
	});

	it("returns false when single joker with non-joker cards is insufficient", () => {
		const result = canPlayerCapture({
			playerCards: [createCard("p1", 3, SUIT.DIAMONDS), createJoker("p2")],
			enemyCard: createCard("e1", 10, SUIT.DIAMONDS),
		});

		expect(result).toBe(false);
	});

	it("handles multiple jokers with suit cards (highest non-joker determines joker value)", () => {
		const result = canPlayerCapture({
			playerCards: [
				createCard("p1", 4, SUIT.CLUBS),
				createJoker("p2"),
				createJoker("p3"),
			],
			enemyCard: createCard("e1", 12, SUIT.CLUBS),
		});

		expect(result).toBe(true);
	});
});

describe(getHighestEligibleEnemySlotIndexForPlayerCapture.name, () => {
	it("returns null when no player cards are selected", () => {
		const result = getHighestEligibleEnemySlotIndexForPlayerCapture({
			playerSlots: [
				{ id: "p1", value: 3, suit: SUIT.HEARTS },
				null,
				null,
				null,
			],
			enemySlots: [{ id: "e1", value: 5, suit: SUIT.HEARTS }, null, null, null],
			playerCardIndices: [],
		});

		expect(result).toBeNull();
	});

	it("returns null when no enemy card is eligible", () => {
		const result = getHighestEligibleEnemySlotIndexForPlayerCapture({
			playerSlots: [{ id: "p1", value: 3, suit: SUIT.CLUBS }, null, null, null],
			enemySlots: [
				{ id: "e1", value: 7, suit: SUIT.HEARTS },
				{ id: "e2", value: 8, suit: SUIT.DIAMONDS },
				null,
				null,
			],
			playerCardIndices: [0],
		});

		expect(result).toBeNull();
	});

	it("returns the highest value eligible enemy card index", () => {
		const result = getHighestEligibleEnemySlotIndexForPlayerCapture({
			playerSlots: [
				{ id: "p1", value: 3, suit: SUIT.HEARTS },
				{ id: "p2", value: 2, suit: SUIT.HEARTS },
				null,
				null,
			],
			enemySlots: [
				{ id: "e1", value: 4, suit: SUIT.HEARTS },
				{ id: "e2", value: 5, suit: SUIT.HEARTS },
				{ id: "e3", value: 8, suit: SUIT.HEARTS },
				null,
			],
			playerCardIndices: [0, 1],
		});

		expect(result).toBe(1);
	});

	it("supports jokers when selecting an eligible enemy card", () => {
		const result = getHighestEligibleEnemySlotIndexForPlayerCapture({
			playerSlots: [
				{ id: "p1", value: 3, suit: SUIT.SPADES },
				{ id: "p2", value: 0, suit: null },
				null,
				null,
			],
			enemySlots: [
				{ id: "e1", value: 5, suit: SUIT.SPADES },
				{ id: "e2", value: 7, suit: SUIT.SPADES },
				null,
				null,
			],
			playerCardIndices: [0, 1],
		});

		expect(result).toBe(0);
	});
});
