import { z } from 'zod'

export const clerkWebhookHeadersSchema = z.object({
  'svix-id': z.string(),
  'svix-timestamp': z.string(),
  'svix-signature': z.string(),
})

export const clerkUserCreatedSchema = z.object({
  data: z.object({
    id: z.string(),
    email_addresses: z.array(z.object({
      email_address: z.string().email(),
      id: z.string(),
    })),
    phone_numbers: z.array(z.object({
      phone_number: z.string(),
    })).optional(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
  }),
  type: z.literal('user.created'),
})

export const clerkUserUpdatedSchema = clerkUserCreatedSchema.extend({
  type: z.literal('user.updated'),
})

export const clerkUserDeletedSchema = z.object({
  data: z.object({
    id: z.string(),
    deleted: z.boolean(),
  }),
  type: z.literal('user.deleted'),
})

export const clerkWebhookSchema = z.discriminatedUnion('type', [
  clerkUserCreatedSchema,
  clerkUserUpdatedSchema,
  clerkUserDeletedSchema,
])
