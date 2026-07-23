import { useTranslation } from 'react-i18next'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SearchCommand } from '@/components/SearchCommand'
import { Menu, Globe } from 'lucide-react'
import { useEffect } from 'react'

export default function AppTopbar() {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const { user } = useUser()
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)
  const language = useUiStore((s) => s.language)
  const setLanguage = useUiStore((s) => s.setLanguage)

  useEffect(() => {
    if (user) {
      const role = user.unsafeMetadata?.role as string || 'PATIENT'
      setUser(role, user.fullName || user.emailAddresses[0]?.emailAddress || '')
    }
  }, [user, setUser])

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="size-5" />
      </Button>

      <div className="flex-1">
        <SearchCommand />
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
      >
        <Globe className="size-4" />
        {language === 'en' ? 'বাংলা' : 'English'}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger render={<button />}>
          <Button variant="ghost" className="relative size-8 rounded-full">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.fullName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            {user?.fullName || user?.emailAddresses[0]?.emailAddress}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { signOut(); clearUser() }}>
            {t('auth.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
