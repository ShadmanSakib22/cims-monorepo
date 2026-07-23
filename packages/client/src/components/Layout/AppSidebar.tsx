import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard, Users, Stethoscope, CalendarClock,
  ListOrdered, FileText, BarChart3, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNav = [
  { to: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'nav.patients', icon: Users },
  { to: '/doctors', label: 'nav.doctors', icon: Stethoscope },
  { to: '/appointments', label: 'nav.appointments', icon: CalendarClock },
  { to: '/queue', label: 'nav.queue', icon: ListOrdered },
  { to: '/documents', label: 'nav.documents', icon: FileText },
  { to: '/analytics', label: 'nav.analytics', icon: BarChart3 },
  { to: '/settings', label: 'nav.settings', icon: Settings },
]

const doctorNav = adminNav.filter((n) =>
  ['/dashboard', '/appointments', '/queue', '/patients', '/documents'].includes(n.to)
)

const receptionNav = adminNav.filter((n) =>
  ['/dashboard', '/patients', '/appointments', '/queue', '/documents'].includes(n.to)
)

export default function AppSidebar() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.role)

  const navItems = role === 'ADMIN' ? adminNav
    : role === 'DOCTOR' ? doctorNav
    : receptionNav

  return (
    <aside className="flex w-60 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b border-sidebar-border px-6">
        <h1 className="text-base font-semibold tracking-tight">{t('app.name')}</h1>
      </div>
      <nav className="flex flex-col gap-0.5 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )
            }
          >
            <item.icon className="size-4 shrink-0" />
            {t(item.label)}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
