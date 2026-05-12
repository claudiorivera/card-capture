import { createFileRoute } from "@tanstack/react-router";
import { CardSlot } from "#/components/card-slot";
import { DiscardPile } from "#/components/discard-pile";
import { DrawDeck } from "#/components/draw-deck";
import { EmptyCard } from "#/components/empty-card";
import { Joker } from "#/components/joker";
import { ModeToggle } from "#/components/mode-toggle";
import { RegularCard } from "#/components/regular-card";

export const Route = createFileRoute("/debug")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-4 flex flex-col gap-4">
			<div className="self-end">
				<ModeToggle />
			</div>
			<div className="grid grid-cols-2 gap-4">
				<DrawDeck cards={[]} />
				<DiscardPile cards={[{ id: "1", suit: "HEARTS", value: 2 }]} />
				<CardSlot isSelected={false} onSelect={() => {}}>
					<Joker />
				</CardSlot>
				<CardSlot isSelected={true} onSelect={() => {}}>
					<Joker />
				</CardSlot>
				<CardSlot isSelected={false} onSelect={() => {}}>
					<EmptyCard />
				</CardSlot>
				<CardSlot isSelected={true} onSelect={() => {}}>
					<EmptyCard />
				</CardSlot>
				<CardSlot isSelected={false} onSelect={() => {}}>
					<RegularCard card={{ id: "123", suit: "CLUBS", value: 5 }} />
				</CardSlot>
				<CardSlot isSelected={true} onSelect={() => {}}>
					<RegularCard card={{ id: "456", suit: "CLUBS", value: 5 }} />
				</CardSlot>
				<CardSlot isSelected={false} onSelect={() => {}}>
					<RegularCard card={{ id: "abc", suit: "HEARTS", value: 12 }} />
				</CardSlot>
				<CardSlot isSelected={true} onSelect={() => {}}>
					<RegularCard card={{ id: "xyz", suit: "HEARTS", value: 12 }} />
				</CardSlot>
			</div>
		</div>
	);
}
