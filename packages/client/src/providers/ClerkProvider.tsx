import { ClerkProvider as ClerkRootProvider, useUser } from '@clerk/clerk-react'
import type { ReactNode } from 'react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export function ClerkProvider({ children }: { children: ReactNode }) {
  if (!PUBLISHABLE_KEY) {
    throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY env var')
  }

  return (
    <ClerkRootProvider publishableKey={PUBLISHABLE_KEY}>
      <ClerkSync>{children}</ClerkSync>
    </ClerkRootProvider>
  )
}

function ClerkSync({ children }: { children: ReactNode }) {
  const { isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
