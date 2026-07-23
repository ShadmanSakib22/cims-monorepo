import type { UserRole } from '@prisma/client'

export interface AuthenticatedUser {
  userId: string
  clerkId: string
  email: string
  name: string
  role: UserRole
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}
