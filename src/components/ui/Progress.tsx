import * as React from 'react'
import * as P from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

export const Progress = React.forwardRef<React.ElementRef<typeof P.Root>, React.ComponentPropsWithoutRef<typeof P.Root>>(
  ({ className, value, ...props }, ref) => (
    <P.Root ref={ref} className={cn('relative h-4 w-full overflow-hidden rounded-full', className)} style={{ background:'var(--color-muted)' }} {...props}>
      <P.Indicator className='h-full w-full flex-1 transition-all' style={{ transform:`translateX(-${100-(value||0)}%)`, background:'var(--color-primary)' }} />
    </P.Root>
  )
)
Progress.displayName = 'Progress'
