import type { Card, Slot } from "./game-machine";

export function compactSlots(slots: Slot[]): Slot[] {
  const compactedCards = slots.filter((card): card is Card => card !== null);
  return [ ...Array(slots.length - compactedCards.length).fill(null), ...compactedCards ];
}

export function discardPlayerCards({ playerSlots, discardPile, slotsToDiscard }: {
  playerSlots: Slot[],
  discardPile: Card[],
  slotsToDiscard: number[],
}) {
  const updatedSlots = playerSlots.map((slot, index) =>
    slotsToDiscard.includes(index) ? null : slot
  );

  const discardedCards = slotsToDiscard
    .map((index) => playerSlots[index])
    .filter((card): card is Card => card !== null);

  return {
    playerSlots: updatedSlots,
    discardPile: [...discardPile, ...discardedCards],
  };
}


export function refillSlots({ slots, deck }: {
  slots: Slot[];
  deck: Card[];
}) {
  return slots.reduceRight(
    ({ updatedSlots, updatedDeck }, slot, index) => {
      if (slot === null && updatedDeck.length > 0) {
        const [drawnCard, ...remainingDeck] = updatedDeck;
        updatedSlots[index] = drawnCard;
        return { updatedSlots, updatedDeck: remainingDeck };
      }
      updatedSlots[index] = slot;
      return { updatedSlots, updatedDeck };
    },
    { updatedSlots: [...slots], updatedDeck: [...deck] }
  );
}

export function drawPlayerCards({
  playerSlots,
  playerDeck,
  playerDiscardPile
}: {
  playerSlots: Slot[];
  playerDeck: Card[];
  playerDiscardPile: Card[];
}) {
  const slots = [...playerSlots];

  const reshuffledDeck = playerDeck.length === 0 && playerDiscardPile.length > 0
    ? [...playerDiscardPile].sort(() => Math.random() - 0.5)
    : [...playerDeck];

  const { updatedSlots, updatedDeck } = refillSlots({ slots, deck: reshuffledDeck });
  
  return {
    slots: updatedSlots.every((slot, index) => slot === playerSlots[index])
      ? updatedSlots
      : compactSlots(updatedSlots),
    deck: updatedDeck,
    discard: playerDeck.length === 0 && playerDiscardPile.length > 0 ? [] : playerDiscardPile
  };
}