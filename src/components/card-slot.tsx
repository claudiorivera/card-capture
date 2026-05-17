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
				"h-36 cursor-pointer w-24 data-[state=on]:scale-110 data-[state=on]:animate-wiggle data-[state=on]:rotate-1 font-black text-xl has-data-[slot=empty-card]:border-dashed border-2 transition-transform duration-200",
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
