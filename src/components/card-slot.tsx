import type { ComponentProps, ReactNode } from "react";
import { Card } from "#/components/ui/card";
import { Toggle } from "#/components/ui/toggle";
import { cn } from "#/lib/utils";

export function CardSlot({
	isSelected,
	onSelect,
	children,
	className,
}: {
	isSelected: boolean;
	onSelect: () => void;
	children: ReactNode;
} & ComponentProps<typeof Toggle>) {
	return (
		<Toggle
			className={cn(
				"h-36 w-24 data-[state=on]:border-green-500 font-black text-2xl has-data-[slot=empty-card]:border-dashed border-2",
				className,
			)}
			pressed={isSelected}
			onPressedChange={onSelect}
			asChild
		>
			<Card className="p-0">{children}</Card>
		</Toggle>
	);
}
