import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onClick, ...props }, ref) => {
  const context = React.useContext(DropdownContext);

  return (
    <button
      ref={ref}
      className={cn(className)}
      onClick={(e) => {
        context?.setOpen(!context?.open);
        onClick?.(e);
      }}
      {...props}
    />
  );
});

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center';
}

export function DropdownMenuContent({ children, className, align = 'end' }: DropdownMenuContentProps) {
  const context = React.useContext(DropdownContext);

  if (!context?.open) return null;

  const alignClass = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  }[align];

  return (
    <div
      className={cn(
        'absolute top-full mt-1 bg-popover text-popover-foreground rounded-md border border-border shadow-md z-50',
        alignClass,
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, onClick, ...props }, ref) => {
  const context = React.useContext(DropdownContext);

  return (
    <div
      ref={ref}
      className={cn('px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors', className)}
      onClick={(e) => {
        context?.setOpen(false);
        onClick?.(e);
      }}
      {...props}
    />
  );
});

DropdownMenuItem.displayName = 'DropdownMenuItem';

export function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 py-2 font-semibold text-sm', className)}>{children}</div>;
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1 h-px bg-border', className)} />;
}
