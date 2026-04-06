import * as React from 'react'
import * as D from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog  = D.Root
export const DialogTrigger = D.Trigger

export const DialogOverlay = React.forwardRef<React.ElementRef<typeof D.Overlay>, React.ComponentPropsWithoutRef<typeof D.Overlay>>(
  ({ className, ...p }, ref) => (
    <D.Overlay ref={ref} className={cn('fixed inset-0 z-50 bg-black/55 backdrop-blur-sm', className)} {...p} />
  )
)
DialogOverlay.displayName = 'DialogOverlay'

export const DialogContent = React.forwardRef<React.ElementRef<typeof D.Content>, React.ComponentPropsWithoutRef<typeof D.Content>>(
  ({ className, children, ...p }, ref) => (
    <D.Portal>
      <DialogOverlay />
      <D.Content ref={ref}
        className={cn('fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl shadow-2xl', className)}
        style={{ background:'var(--color-card)', border:'1px solid var(--color-border)' }}
        {...p}
      >
        {children}
        <D.Close className='absolute right-4 top-4 opacity-50 hover:opacity-100 transition-opacity'>
          <X size={16} /><span className='sr-only'>Close</span>
        </D.Close>
      </D.Content>
    </D.Portal>
  )
)
DialogContent.displayName = 'DialogContent'

export const DialogHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('px-6 py-4 border-b', className)} style={{ borderColor:'var(--color-border)' }} {...p} />

export const DialogFooter = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('flex justify-end gap-2 px-6 py-4 border-t', className)} style={{ borderColor:'var(--color-border)' }} {...p} />

export const DialogTitle = React.forwardRef<React.ElementRef<typeof D.Title>, React.ComponentPropsWithoutRef<typeof D.Title>>(
  ({ className, ...p }, ref) => <D.Title ref={ref} className={cn('text-base font-bold leading-none', className)} style={{ fontFamily:'var(--font-heading)' }} {...p} />
)
DialogTitle.displayName = 'DialogTitle'
