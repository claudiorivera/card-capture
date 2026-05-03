import type { Card, Joker, Slot } from "#/lib/core/cards";

export function compactSlots(slots: Slot[]): Slot[] {
	const compactedCards = slots.filter((card): card is Card => card !== null);

	return [
		...Array(slots.length - compactedCards.length).fill(null),
		...compactedCards,
	];
}

type MoveCardsToBottomOfDeckParams = {
	slots: Slot[];
	deck: Card[];
	indicesToMove: number[];
};

export function moveCardsToBottomOfDeck({
	slots,
	deck,
	indicesToMove,
}: MoveCardsToBottomOfDeckParams) {
	const uniqueIndices = Array.from(new Set(indicesToMove));
	const cardsToMove: Card[] = [];

	for (const index of uniqueIndices) {
		const card = slots.at(index);
		if (card && card !== null) {
			cardsToMove.push(card);
		}
	}

	return {
		slots: slots.map((slot, index) =>
			uniqueIndices.includes(index) ? null : slot,
		),
		deck: [...deck, ...cardsToMove],
	};
}

export type DiscardPlayerCardsParams = {
	playerSlots: Slot[];
	discardPile: Card[];
	slotsToDiscard: number[];
};

export function discardPlayerCards({
	playerSlots,
	discardPile,
	slotsToDiscard,
}: DiscardPlayerCardsParams) {
	const newPlayerSlots = playerSlots.map((slot, index) =>
		slotsToDiscard.includes(index) ? null : slot,
	);

	const discardedCards = slotsToDiscard
		.map((index) => playerSlots.at(index))
		.filter((card): card is Card => card !== null);

	return {
		playerSlots: newPlayerSlots,
		discardPile: [...discardPile, ...discardedCards],
	};
}

export type RefillSlotsParams = {
	slots: Slot[];
	deck: Card[];
};

export function refillSlots({ slots, deck }: RefillSlotsParams) {
	const emptyIndices = slots
		.map((slot, index) => (slot === null ? index : null))
		.filter((index): index is number => typeof index === "number")
		.toReversed();

	const updatedSlots = emptyIndices.reduce(
		({ deckIndex, slots }, slotIndex) =>
			deckIndex < deck.length
				? {
						slots: slots.with(slotIndex, deck.at(deckIndex) ?? null),
						deckIndex: deckIndex + 1,
					}
				: { slots, deckIndex },
		{ slots: [...slots], deckIndex: 0 },
	).slots;

	const updatedDeck = deck.toSpliced(0, emptyIndices.length);

	return { updatedSlots, updatedDeck };
}

export type DrawPlayerCardsParams = {
	playerSlots: Slot[];
	playerDeck: Card[];
	playerDiscardPile: Card[];
};

export function drawPlayerCards({
	playerSlots,
	playerDeck,
	playerDiscardPile,
}: DrawPlayerCardsParams) {
	const deck =
		playerDeck.length === 0 && playerDiscardPile.length > 0
			? playerDiscardPile.toSorted(() => Math.random() - 0.5)
			: playerDeck;

	const { updatedSlots, updatedDeck } = refillSlots({
		slots: playerSlots,
		deck,
	});

	return {
		slots: updatedSlots.every((slot, index) => slot === playerSlots.at(index))
			? updatedSlots
			: compactSlots(updatedSlots),
		deck: updatedDeck,
		discard:
			playerDeck.length === 0 && playerDiscardPile.length > 0
				? []
				: playerDiscardPile,
	};
}

export function isElite(card: Card) {
	return (
		card.value === 11 ||
		card.value === 12 ||
		card.value === 13 ||
		card.value === 14
	);
}

export function isJoker(card: Card): card is Joker {
	return card.value === 0 && card.suit === null;
}

export type CanPlayerCaptureParams = { playerCards: Card[]; enemyCard: Card };

export function canPlayerCapture({
	playerCards,
	enemyCard,
}: CanPlayerCaptureParams) {
	if (!enemyCard.suit) return false;

	if (playerCards.length === 0) return false;

	const jokers = playerCards.filter(isJoker);
	const nonJokerCards = playerCards.filter((card) => !isJoker(card));

	if (jokers.length > 0 && nonJokerCards.length === 0) return false;

	const baseSuit = nonJokerCards.at(0)?.suit;

	if (!playerCards.every((c) => isJoker(c) || c.suit === baseSuit))
		return false;

	if (baseSuit !== enemyCard.suit) return false;

	const highestValue = Math.max(
		...nonJokerCards.map((nonJokerCard) => nonJokerCard.value),
	);

	const sum = playerCards.reduce(
		(totalValue, card) =>
			totalValue + (isJoker(card) ? highestValue : card.value),
		0,
	);

	return sum >= enemyCard.value;
}

export type PerformPlayerCaptureParams = {
	playerSlots: Slot[];
	playerDiscardPile: Card[];
	enemySlots: Slot[];
	enemySlotIndex: number;
	playerCardIndices: number[];
};

export function performPlayerCapture({
	playerSlots,
	playerDiscardPile,
	enemySlots,
	enemySlotIndex,
	playerCardIndices,
}: PerformPlayerCaptureParams) {
	const selectedPlayerCards = playerCardIndices
		.map((index) => playerSlots.at(index))
		.filter((slot): slot is Card => typeof slot !== "undefined");
	const enemyCard = enemySlots.at(enemySlotIndex);

	return {
		playerSlots: playerSlots.map((slot, index) =>
			playerCardIndices.includes(index) ? null : slot,
		),
		playerDiscardPile: enemyCard
			? [...playerDiscardPile, ...selectedPlayerCards, enemyCard]
			: playerDiscardPile,
		enemySlots: enemySlots.with(enemySlotIndex, null),
	};
}

export type PerformEnemyCaptureParams = {
	playerSlots: Slot[];
	enemySlots: Slot[];
	enemyDiscardPile: Card[];
	playerDiscardPile: Card[];
	playerSlotIndex: number;
};

export function performEnemyCapture({
	playerSlots,
	enemySlots,
	enemyDiscardPile,
	playerDiscardPile,
	playerSlotIndex,
}: PerformEnemyCaptureParams) {
	const playerCard = playerSlots.at(playerSlotIndex);
	const enemyCard = enemySlots.at(0);

	return {
		playerSlots: playerSlots.with(playerSlotIndex, null),
		enemySlots: enemySlots.with(0, null),
		enemyDiscardPile: enemyCard
			? [...enemyDiscardPile, enemyCard]
			: enemyDiscardPile,
		playerDiscardPile: playerCard
			? [...playerDiscardPile, playerCard]
			: playerDiscardPile,
	};
}

export type PerformSacrificeParams = {
	playerSlots: Slot[];
	enemySlots: Slot[];
	enemyDeck: Card[];
	enemySlotIndex: number;
	enemyDiscardPile: Card[];
	playerDiscardPile: Card[];
	playerCardIndices: number[];
};

export function performSacrifice({
	playerSlots,
	enemySlots,
	enemyDeck,
	enemySlotIndex,
	enemyDiscardPile,
	playerDiscardPile,
	playerCardIndices,
}: PerformSacrificeParams) {
	const sacrificedPlayerCards = playerCardIndices
		.map((index) => playerSlots.at(index))
		.filter((slot): slot is Card => typeof slot !== "undefined");
	const enemyCard = enemySlots.at(enemySlotIndex);

	return {
		playerSlots: playerSlots.map((slot, i) =>
			playerCardIndices.includes(i) ? null : slot,
		),
		playerDiscardPile,
		enemySlots: enemySlots.with(enemySlotIndex, null),
		enemyDeck: enemyCard ? [...enemyDeck, enemyCard] : enemyDeck,
		enemyDiscardPile: [...enemyDiscardPile, ...sacrificedPlayerCards],
	};
}
