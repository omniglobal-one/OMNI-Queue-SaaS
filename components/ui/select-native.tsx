import * as React from 'react'
import { cn } from '@/lib/utils'

// A native <select> styled to match the shadcn input language, with a
// custom chevron (no default browser arrow). Simpler than wiring the full
// Radix Select for this app's needs — same reasoning as OMNI Booking's
// select.input treatment, just themed to this app's CSS variables instead.
const SelectNative = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
)
SelectNative.displayName = 'SelectNative'

export { SelectNative }
