import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  withText?: boolean
  href?: string | null
  className?: string
  imageClassName?: string
  textClassName?: string
}

export default function Logo({
  withText = true,
  href = '/',
  className,
  imageClassName,
  textClassName,
}: LogoProps) {
  const containerClass = cn('inline-flex items-center gap-3', className)
  const imageClasses = cn('h-10 w-10', imageClassName)

  const content = (
    <>
      <Image
        src="/logo.svg"
        alt="SubitAI logo"
        width={40}
        height={40}
        priority
        className={imageClasses}
      />
      {withText && (
        <span className={cn('text-xl font-semibold tracking-tight text-neutral-900', textClassName)}>
          SUBIT AI
        </span>
      )}
    </>
  )

  if (!href) {
    return <div className={containerClass}>{content}</div>
  }

  return (
    <Link href={href} className={containerClass}>
      {content}
    </Link>
  )
}
