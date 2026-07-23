import { TaskResetPassword } from '@clerk/clerk-react'
import { signInAppearance } from '@/lib/auth'

export function Component() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <p className="mb-4 text-center text-sm text-muted-foreground">
          Reset your password
        </p>
        <TaskResetPassword
          redirectUrlComplete="/login"
          appearance={signInAppearance}
        />
      </div>
    </div>
  )
}
