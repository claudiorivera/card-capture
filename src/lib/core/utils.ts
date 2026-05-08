import {
	type Joker,
	type PlayingCard,
	type Slot,
	shuffle,
} from "#/lib/core/cards";

export function compactSlots(slots: Slot[]): Slot[] {
	const compactedCards = slots.filter(
		(card): card is PlayingCard => card !== null,
	);

	return [
		...Array(slots.length - compactedCards.length).fill(null),
		...compactedCards,
	];
}

type MoveCardsToBottomOfDeckParams = {
	slots: Slot[];
	deck: PlayingCard[];
	indicesToMove: number[];
};

export function moveCardsToBottomOfDeck({
	slots,
	deck,
	indicesToMove,
}: MoveCardsToBottomOfDeckParams) {
	const uniqueIndices = Array.from(new Set(indicesToMove));
	const cardsToMove: PlayingCard[] = [];

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

export type MoveSlotsToDiscardParams = {
	slots: Slot[];
	discardPile: PlayingCard[];
	slotsToDiscard: number[];
};

export function moveSlotsToDiscard({
	slots,
	discardPile,
	slotsToDiscard,
}: MoveSlotsToDiscardParams) {
	const newSlots = slots.map((slot, index) =>
		slotsToDiscard.includes(index) ? null : slot,
	);

	const discardedCards = slotsToDiscard
		.map((index) => slots.at(index))
		.filter((card): card is PlayingCard => card !== null);

	return {
		slots: newSlots,
		discardPile: [...discardPile, ...discardedCards],
	};
}

export type RefillSlotsParams = {
	slots: Slot[];
	deck: PlayingCard[];
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

export type DrawCardsParams = {
	slots: Slot[];
	drawDeck: PlayingCard[];
	discardPile: PlayingCard[];
};

export function drawCards({ slots, drawDeck, discardPile }: DrawCardsParams) {
	const { updatedSlots: slotsAfterFirstPass, updatedDeck: deckAfterFirstPass } =
		refillSlots({
			slots,
			deck: drawDeck,
		});

	const shouldShuffleDiscard =
		deckAfterFirstPass.length === 0 && discardPile.length > 0;
	const deckForSecondPass = shouldShuffleDiscard
		? shuffle(discardPile)
		: deckAfterFirstPass;

	const { updatedSlots, updatedDeck } = refillSlots({
		slots: slotsAfterFirstPass,
		deck: deckForSecondPass,
	});

	return {
		slots: updatedSlots.every((slot, index) => slot === slots.at(index))
			? updatedSlots
			: compactSlots(updatedSlots),
		deck: updatedDeck,
		discard: shouldShuffleDiscard ? [] : discardPile,
	};
}

export function isElite(card: PlayingCard) {
	return (
		card.value === 11 ||
		card.value === 12 ||
		card.value === 13 ||
		card.value === 14
	);
}

export function isJoker(card: PlayingCard): card is Joker {
	return card.value === 0 && card.suit === null;
}

export type CanPlayerCaptureParams = {
	playerCards: PlayingCard[];
	enemyCard: PlayingCard;
};

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
	playerDiscardPile: PlayingCard[];
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
		.filter((slot): slot is PlayingCard => typeof slot !== "undefined");
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
	enemyDiscardPile: PlayingCard[];
	playerDiscardPile: PlayingCard[];
	playerSlotIndex: number;
};

export function performEnemyCapture({
	playerSlots,
	enemySlots,
	enemyDiscardPile,
	playerSlotIndex,
}: PerformEnemyCaptureParams) {
	const playerCard = playerSlots.at(playerSlotIndex);
	const enemyCard = enemySlots.at(3);

	return {
		playerSlots: playerSlots.with(playerSlotIndex, null),
		enemySlots: enemySlots.with(3, null),
		enemyDiscardPile:
			enemyCard && playerCard
				? [playerCard, enemyCard, ...enemyDiscardPile]
				: enemyDiscardPile,
	};
}

export type PerformSacrificeParams = {
	playerSlots: Slot[];
	enemySlots: Slot[];
	enemyDeck: PlayingCard[];
	enemySlotIndex: number;
	enemyDiscardPile: PlayingCard[];
	playerDiscardPile: PlayingCard[];
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
		.filter((slot): slot is PlayingCard => typeof slot !== "undefined");
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
