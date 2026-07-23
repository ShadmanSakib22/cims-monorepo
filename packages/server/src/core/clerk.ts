import type { Request, Response, NextFunction } from 'express'
import { clerkClient } from '@clerk/clerk-sdk-node'
import prisma from './prisma.js'
import { UnauthorizedError } from './errors.js'
import type { AuthenticatedUser } from './types/index.js'

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Missing or invalid authorization header'))
    }
    const token = authHeader.slice(7)
    const { sub } = await clerkClient.verifyToken(token)
    const user = await prisma.user.findUnique({ where: { clerkId: sub } })
    if (!user || !user.isActive) {
      return next(new UnauthorizedError('User not found or inactive'))
    }
    req.user = {
      userId: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      role: user.role,
    }
    next()
  } catch (err) {
    return next(new UnauthorizedError('Invalid token'))
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new UnauthorizedError('Insufficient permissions'))
    }
    next()
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return next()
    const token = authHeader.slice(7)
    const { sub } = await clerkClient.verifyToken(token)
    const user = await prisma.user.findUnique({ where: { clerkId: sub } })
    if (user?.isActive) {
      req.user = {
        userId: user.id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    }
    next()
  } catch {
    next()
  }
}
