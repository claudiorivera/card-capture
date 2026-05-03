import { describe, expect, it } from "vitest";
import { type PlayingCard, type Slot, SUIT } from "#/lib/core/cards";
import {
	compactSlots,
	discardPlayerCards,
	drawPlayerCards,
	moveCardsToBottomOfDeck,
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
		const deck: PlayingCard[] = [
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
		const deck: PlayingCard[] = [{ value: 9, suit: SUIT.SPADES }];
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
		const deck: PlayingCard[] = [{ value: 2, suit: SUIT.DIAMONDS }];
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
	describe("moveCardsToBottomOfDeck", () => {
		const aceHearts: PlayingCard = { value: 14, suit: SUIT.HEARTS };
		const tenDiamonds: PlayingCard = { value: 10, suit: SUIT.DIAMONDS };
		const fiveClubs: PlayingCard = { value: 5, suit: SUIT.CLUBS };
		const joker: PlayingCard = { value: 0, suit: null };

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
