import type { Card, Slot } from "./game-machine";

export function compactSlots(slots: Slot[]): Slot[] {
  const compactedCards = slots.filter((card): card is Card => card !== null);
  return [ ...Array(slots.length - compactedCards.length).fill(null), ...compactedCards ];
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