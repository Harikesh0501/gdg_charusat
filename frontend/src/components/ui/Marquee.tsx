'use client'

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface MarqueeProps {
  children: React.ReactNode
  direction?: 'left' | 'right'
  speed?: 'slow' | 'normal' | 'fast'
  pauseOnHover?: boolean
  className?: string
}

export function Marquee({
  children,
  direction = 'left',
  speed = 'normal',
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const speedDuration = {
    slow: 'duration-[60s]',
    normal: 'duration-[35s]',
    fast: 'duration-[20s]',
  }

  return (
    <div
      className={twMerge(
        'group relative flex overflow-hidden p-2 [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]',
        className
      )}
    >
      <div
        className={clsx(
          'flex shrink-0 items-center justify-around gap-4 min-w-full animate-marquee',
          speedDuration[speed],
          direction === 'right' && '[animation-direction:reverse]',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={clsx(
          'flex shrink-0 items-center justify-around gap-4 min-w-full animate-marquee',
          speedDuration[speed],
          direction === 'right' && '[animation-direction:reverse]',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
      >
        {children}
      </div>
    </div>
  )
}
