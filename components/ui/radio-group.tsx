"use client";

import * as React from "react";
import { cn } from "./utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="radio"
        value={value}
        className={cn(
          "h-4 w-4 border border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

function RadioGroup({ className, value, onValueChange, children, ...props }: RadioGroupProps) {
  return (
    <div className={cn("grid gap-2", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === RadioGroupItem) {
          return React.cloneElement(child, {
            checked: value === child.props.value,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              onValueChange?.(e.target.value);
            },
          } as any);
        }
        return child;
      })}
    </div>
  );
}

export { RadioGroup, RadioGroupItem };
