import type { Request, Response, NextFunction } from 'express'
import prisma from './prisma.js'
import { UnauthorizedError } from './errors.js'
import type { AuthenticatedUser } from './types/index.js'

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'))
  }

  const token = authHeader.slice(7)

  const sessionClaims = parseJwt(token)
  if (!sessionClaims?.sub) {
    return next(new UnauthorizedError('Invalid token'))
  }

  prisma.user.findUnique({ where: { clerkId: sessionClaims.sub } })
    .then((user) => {
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
    })
    .catch(next)
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new UnauthorizedError('Insufficient permissions'))
    }
    next()
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.slice(7)
  const sessionClaims = parseJwt(token)
  if (!sessionClaims?.sub) {
    return next()
  }

  prisma.user.findUnique({ where: { clerkId: sessionClaims.sub } })
    .then((user) => {
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
    })
    .catch(() => next())
}

function parseJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
  } catch {
    return null
  }
}
