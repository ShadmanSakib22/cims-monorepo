import type { Request, Response, NextFunction } from 'express'
import { Webhook } from 'svix'
import logger from '@/core/logger.js'
import { syncUserFromClerk, deactivateUser } from './auth.service.js'
import { clerkWebhookSchema } from './auth.schema.js'

export async function handleClerkWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const secret = process.env.CLERK_WEBHOOK_SECRET
    if (!secret) {
      return res.status(500).json({ error: 'Webhook secret not configured' })
    }

    const svixId = req.headers['svix-id'] as string
    const svixTimestamp = req.headers['svix-timestamp'] as string
    const svixSignature = req.headers['svix-signature'] as string

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ error: 'Missing svix headers' })
    }

    const payload = JSON.stringify(req.body)
    const wh = new Webhook(secret)
    const headers = {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }

    try {
      wh.verify(payload, headers)
    } catch {
      return res.status(401).json({ error: 'Invalid webhook signature' })
    }

    const parsed = clerkWebhookSchema.parse(req.body)

    switch (parsed.type) {
      case 'user.created':
      case 'user.updated': {
        const emails = parsed.data.email_addresses
        const phones = parsed.data.phone_numbers
        await syncUserFromClerk({
          id: parsed.data.id,
          email: emails[0]?.email_address ?? '',
          phone: phones?.[0]?.phone_number,
          firstName: parsed.data.first_name,
          lastName: parsed.data.last_name,
        })
        break
      }
      case 'user.deleted': {
        await deactivateUser(parsed.data.id)
        break
      }
    }

    res.status(200).json({ received: true })
  } catch (err) {
    logger.error({ err }, 'Clerk webhook processing failed')
    next(err)
  }
}
