'use client'

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  shimmer?: boolean
}

export function Card({
  className,
  hoverEffect = true,
  shimmer = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'relative rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-200',
          hoverEffect && 'hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-6px_rgba(99,102,241,0.08)] hover:border-indigo-200/80',
          shimmer && 'ring-1 ring-indigo-500/20 shadow-indigo-500/10',
          className
        )
      )}
      {...props}
    >
      {shimmer && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600" />
      )}
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge('p-5 sm:p-6 pb-3 sm:pb-4 flex flex-col gap-1', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={twMerge('text-lg sm:text-xl font-bold tracking-tight text-slate-900', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={twMerge('text-xs sm:text-sm text-slate-500 font-normal leading-relaxed', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge('p-5 sm:p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge('p-5 sm:p-6 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
}
