import { cn } from "@/lib/utils";
import React from "react";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-none group/bento hover:shadow-2xl transition duration-200 shadow-none p-6 bg-card border border-border justify-between flex flex-col space-y-4 hover:border-primary/50",
                className
            )}
        >
            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-none bg-secondary/30 overflow-hidden relative border border-white/5 group-hover/bento:border-primary/20 transition-colors">
                {header}
            </div>
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                <div className="mb-2 mt-2 text-primary font-mono text-xs uppercase tracking-wider">
                    {icon}
                </div>
                <div className="font-display font-medium text-xl text-foreground mb-2 mt-2">
                    {title}
                </div>
                <div className="font-sans font-light text-muted-foreground text-sm leading-relaxed">
                    {description}
                </div>
            </div>
        </div>
    );
};
