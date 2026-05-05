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
    <nav className="flex gap-2 border-b border-gray-200 overflow-x-auto">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors',
            link.active
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
