import prisma from '@/core/prisma.js'
import logger from '@/core/logger.js'
import type { ClerkUserPayload } from './auth.types.js'

export async function syncUserFromClerk(clerkUser: ClerkUserPayload) {
  const name = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(' ')
    || clerkUser.email.split('@')[0]

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  })

  if (existingUser) {
    const updated = await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: {
        email: clerkUser.email,
        phone: clerkUser.phone,
        name,
      },
    })
    logger.info({ userId: updated.id }, 'User updated from Clerk webhook')
    return updated
  }

  const newUser = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email: clerkUser.email,
      phone: clerkUser.phone,
      name,
      role: 'PATIENT',
    },
  })
  logger.info({ userId: newUser.id }, 'User created from Clerk webhook')
  return newUser
}

export async function deactivateUser(clerkId: string) {
  const user = await prisma.user.update({
    where: { clerkId },
    data: { isActive: false },
  })
  logger.info({ userId: user.id }, 'User deactivated from Clerk webhook')
  return user
}
