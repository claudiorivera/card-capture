import { Toggle } from "#/components/ui/toggle";
import type { Slot } from "#/lib/core/cards";
import { isJoker } from "#/lib/core/utils";

export function CardSlot({
	slot,
	isSelected,
	onSelect,
}: {
	slot: Slot;
	isSelected: boolean;
	onSelect: () => void;
}) {
	return (
		<Toggle
			className="h-32 w-18 p-4 text-xs ring-1 ring-foreground/10"
			pressed={isSelected}
			onPressedChange={onSelect}
		>
			{slot === null
				? "X"
				: isJoker(slot)
					? "Joker"
					: `${slot.value} of ${slot.suit}`}
		</Toggle>
	);
}
