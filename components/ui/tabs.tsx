"use client";

import * as React from "react";
import { cn } from "./utils";

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  children?: React.ReactNode;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children?: React.ReactNode;
  "data-value"?: string;
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children?: React.ReactNode;
}

function Tabs({ className, value, children, ...props }: TabsProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  );
}

function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
  const isActive = value === (props as any)["data-value"];
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        className
      )}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ className, value, children, ...props }: TabsContentProps) {
  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
