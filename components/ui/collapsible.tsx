import * as React from "react";
import { cn } from "./utils";

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

function Collapsible({ className, children, ...props }: CollapsibleProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  );
}

function CollapsibleTrigger({ className, children, ...props }: CollapsibleTriggerProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function CollapsibleContent({ className, children, ...props }: CollapsibleContentProps) {
  return (
    <div
      className={cn(
        "overflow-hidden text-sm transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
