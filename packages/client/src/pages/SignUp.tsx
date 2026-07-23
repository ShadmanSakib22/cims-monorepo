import { SignUp } from '@clerk/clerk-react'
import { signUpAppearance } from '@/lib/auth'

export function Component() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <SignUp
          routing="path"
          path="/signup"
          signInUrl="/login"
          appearance={signUpAppearance}
        />
      </div>
    </div>
  )
}
