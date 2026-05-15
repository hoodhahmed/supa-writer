import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
}

export const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild, onMouseEnter, onMouseLeave, ...props }, ref) => {
  const context = React.useContext(TooltipContext);

  return (
    <button
      ref={ref}
      className={cn(className)}
      onMouseEnter={(e) => {
        context?.setOpen(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        context?.setOpen(false);
        onMouseLeave?.(e);
      }}
      {...props}
    />
  );
});

TooltipTrigger.displayName = 'TooltipTrigger';

export function TooltipContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const context = React.useContext(TooltipContext);

  if (!context?.open) return null;

  return (
    <div
      className={cn(
        'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover text-popover-foreground px-3 py-1.5 rounded-md text-sm shadow-md border border-border whitespace-nowrap',
        className
      )}
    >
      {children}
    </div>
  );
}
