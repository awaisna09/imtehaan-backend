import * as React from "react";
import { cn } from "./utils";

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
  children?: React.ReactNode;
}

function AspectRatio({ className, ratio = 16 / 9, children, ...props }: AspectRatioProps) {
  return (
    <div
      className={cn("relative w-full", className)}
      style={{
        aspectRatio: ratio,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export { AspectRatio };
