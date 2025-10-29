"use client";

import * as React from "react";
import { cn } from "./utils";

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export interface SelectValueProps {
  placeholder?: string;
  selectedValue?: string;
}

function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || "");
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  const handleTriggerClick = () => {
    console.log('Trigger clicked, toggling dropdown');
    setIsOpen(!isOpen);
  };

  const handleItemClick = (itemValue: string) => {
    console.log('Item clicked:', itemValue);
    setSelectedValue(itemValue);
    onValueChange?.(itemValue);
    setIsOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && 
        contentRef.current &&
        !triggerRef.current.contains(target) && 
        !contentRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clone children and pass props
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === SelectTrigger) {
        return React.cloneElement(child, {
          onClick: handleTriggerClick,
          ref: triggerRef,
        } as any);
      }
      if (child.type === SelectContent) {
        const contentChildren = React.Children.map(child.props.children, (contentChild) => {
          if (React.isValidElement(contentChild) && contentChild.type === SelectItem) {
            return React.cloneElement(contentChild, {
              onClick: () => handleItemClick((contentChild.props as any).value),
              'data-selected': (contentChild.props as any).value === selectedValue,
            } as any);
          }
          return contentChild;
        });
        
        return React.cloneElement(child, {
          ref: contentRef,
          style: { display: isOpen ? 'block' : 'none' },
          children: contentChildren,
        } as any);
      }
      if (child.type === SelectValue) {
        return React.cloneElement(child, {
          selectedValue: selectedValue,
        } as any);
      }
    }
    return child;
  });

  return (
    <div className="relative">
      {childrenWithProps}
    </div>
  );
}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps & { onClick?: () => void }>(
  ({ className, children, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps & { style?: React.CSSProperties }>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute top-full left-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1",
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

function SelectItem({ value, children, onClick, className, ...props }: SelectItemProps & { onClick?: () => void; 'data-selected'?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        props['data-selected'] && "bg-accent text-accent-foreground",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

function SelectValue({ placeholder, selectedValue }: SelectValueProps) {
  if (selectedValue) {
    return <span className="text-foreground">{selectedValue}x</span>;
  }
  return <span className="text-muted-foreground">{placeholder}</span>;
}

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
