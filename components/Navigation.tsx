'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: '📅 Today', active: pathname === '/dashboard' },
    { href: '/dashboard/weekly', label: '📊 Weekly', active: pathname === '/dashboard/weekly' },
    {
      href: '/dashboard/achievements',
      label: '🏆 Achievements',
      active: pathname === '/dashboard/achievements',
    },
    {
      href: '/dashboard/profile',
      label: '👤 Profile',
      active: pathname === '/dashboard/profile',
    },
  ]

  return (
    <>
      <nav className="hidden overflow-x-auto border-b border-gray-200 bg-white px-4 sm:flex sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors',
                link.active
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] sm:hidden">
        {links.map((link) => {
          const [icon, ...labelParts] = link.label.split(' ')
          const label = labelParts.join(' ')

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-center text-[11px] font-medium transition-colors',
                link.active ? 'text-blue-600' : 'text-gray-500'
              )}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="w-full truncate">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
