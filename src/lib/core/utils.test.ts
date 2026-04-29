import { describe, expect, it } from "vitest";
import { type Card, type Slot, SUIT } from "./game-machine";
import {
	compactSlots,
	discardPlayerCards,
	drawPlayerCards,
	refillSlots,
} from "./utils";

describe(compactSlots.name, () => {
	it("should move all cards to the right and fill with null", () => {
		const slots: Slot[] = [
			null,
			{ value: 5, suit: SUIT.HEARTS },
			null,
			{ value: 10, suit: SUIT.DIAMONDS },
		];

		expect(compactSlots(slots)).toEqual([
			null,
			null,
			{ value: 5, suit: SUIT.HEARTS },
			{ value: 10, suit: SUIT.DIAMONDS },
		]);
	});

	it("should leave an already compact array unchanged", () => {
		const slots: Slot[] = [
			null,
			null,
			{ value: 2, suit: SUIT.CLUBS },
			{ value: 3, suit: SUIT.SPADES },
		];
		expect(compactSlots(slots)).toEqual(slots);
	});
});

describe(refillSlots.name, () => {
	it("should refill empty slots from the deck (right to left)", () => {
		const slots: Slot[] = [null, null, null, null];
		const deck: Card[] = [
			{ value: 7, suit: SUIT.HEARTS },
			{ value: 8, suit: SUIT.DIAMONDS },
		];
		const { updatedSlots, updatedDeck } = refillSlots({ slots, deck });
		expect(updatedSlots).toEqual([
			null,
			null,
			{ value: 8, suit: SUIT.DIAMONDS },
			{ value: 7, suit: SUIT.HEARTS },
		]);
		expect(updatedDeck).toEqual([]);
	});

	it("should leave remaining slots unfilled if the deck is empty", () => {
		const slots: Slot[] = [null, null, null, null];
		const deck: Card[] = [{ value: 9, suit: SUIT.SPADES }];
		const { updatedSlots, updatedDeck } = refillSlots({ slots, deck });
		expect(updatedSlots).toEqual([
			null,
			null,
			null,
			{ value: 9, suit: SUIT.SPADES },
		]);
		expect(updatedDeck).toEqual([]);
	});

	it("should leave filled slots unchanged", () => {
		const slots: Slot[] = [null, { value: 4, suit: SUIT.CLUBS }, null, null];
		const deck: Card[] = [{ value: 2, suit: SUIT.DIAMONDS }];
		const { updatedSlots, updatedDeck } = refillSlots({ slots, deck });
		expect(updatedSlots).toEqual([
			null,
			{ value: 4, suit: SUIT.CLUBS },
			null,
			{ value: 2, suit: SUIT.DIAMONDS },
		]);
		expect(updatedDeck).toEqual([]);
	});
});

describe(discardPlayerCards.name, () => {
	it("should discard specified slots", () => {
		const result = discardPlayerCards({
			discardPile: [],
			playerSlots: [{ value: 5, suit: SUIT.HEARTS }, null, null, null],
			slotsToDiscard: [0],
		});

		expect(result).toEqual({
			discardPile: [{ value: 5, suit: SUIT.HEARTS }],
			playerSlots: [null, null, null, null],
		});
	});
});

describe(drawPlayerCards.name, () => {
	it("should fill empty player slots from the deck", () => {
		const result = drawPlayerCards({
			playerSlots: [null, null, null, null],
			playerDeck: [
				{ value: 6, suit: SUIT.HEARTS },
				{ value: 7, suit: SUIT.DIAMONDS },
			],
			playerDiscardPile: [],
		});

		expect(result.slots).toEqual([
			null,
			null,
			{ value: 7, suit: SUIT.DIAMONDS },
			{ value: 6, suit: SUIT.HEARTS },
		]);
		expect(result.deck).toEqual([]);
		expect(result.discard).toEqual([]);
	});

	it("should reshuffle discard pile into deck when the deck is empty", () => {
		const result = drawPlayerCards({
			playerSlots: [null, null, null, null],
			playerDeck: [],
			playerDiscardPile: [
				{ value: 5, suit: SUIT.CLUBS },
				{ value: 8, suit: SUIT.SPADES },
			],
		});

		expect(result.slots.filter(Boolean).length).toBe(2);
		expect(result.deck).toEqual([]);
		expect(result.discard).toEqual([]);
	});

	it("should handle empty deck and discard pile", () => {
		const result = drawPlayerCards({
			playerSlots: [null, null, { value: 3, suit: SUIT.HEARTS }, null],
			playerDeck: [],
			playerDiscardPile: [],
		});

		expect(result.slots).toEqual([
			null,
			null,
			{ value: 3, suit: SUIT.HEARTS },
			null,
		]);
		expect(result.deck).toEqual([]);
		expect(result.discard).toEqual([]);
	});
});
