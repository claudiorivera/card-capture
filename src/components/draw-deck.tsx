import { Card } from "#/components/ui/card";
import type { PlayingCard } from "#/lib/core/cards";

export function DrawDeck({ cards }: { cards: PlayingCard[] }) {
	return <Card className="h-32 w-18 p-4">{cards.length} cards</Card>;
}
