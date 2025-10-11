"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-blue-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-blue-500",
  titleClassName = "text-blue-500",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-40 w-full max-w-sm sm:w-[24rem] -skew-y-[6deg] select-none flex-col justify-between rounded-xl border-2 bg-white shadow-lg px-5 py-4 transition-all duration-500 hover:shadow-2xl hover:border-gray-300 hover:scale-110 hover:bg-white hover:z-50",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="relative inline-block rounded-full bg-gray-100 p-2 shadow-sm">
          {icon}
        </span>
        <p className={cn("text-lg font-semibold", titleClassName)}>{title}</p>
      </div>
      <p className="text-base font-semibold text-gray-900 leading-tight mb-2">{description}</p>
      <p className="text-sm font-medium text-gray-600">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className: "[grid-area:stack] hover:-translate-y-20 hover:scale-110 hover:z-50 transition-all duration-500 cursor-pointer",
    },
    {
      className: "[grid-area:stack] translate-x-8 translate-y-8 hover:-translate-y-16 hover:scale-110 hover:z-50 transition-all duration-500 cursor-pointer",
    },
    {
      className: "[grid-area:stack] translate-x-16 translate-y-16 hover:-translate-y-12 hover:scale-110 hover:z-50 transition-all duration-500 cursor-pointer",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 h-[400px] md:h-[500px] flex items-center justify-center">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
