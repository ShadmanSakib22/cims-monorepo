import { useAuth, useUser } from '@clerk/clerk-react'
import { Link, Outlet, useNavigate } from 'react-router'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sun, Moon } from 'lucide-react'

function Header() {
  const { isSignedIn, signOut } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-14 items-center justify-between bg-background px-6">
      <Link to="/" className="text-xl font-bold tracking-tight text-primary">
        CIMS
      </Link>

      <nav className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        {isSignedIn ? (
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
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { signOut(); navigate('/') }}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-muted/50 py-6 text-center text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} CIMS. All rights reserved.
    </footer>
  )
}

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
