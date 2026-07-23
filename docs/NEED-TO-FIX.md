# Backend — Need to Fix

## Fixed

### 1. Svix Webhook Signature Verification ✅
`app.ts` now mounts `express.raw({ type: 'application/json' })` on `/api/webhooks` before the global json parser. Controller uses raw Buffer for Svix verification, then parses to JSON for Zod validation.

**Changes:**
- `packages/server/src/app.ts` — added raw parser before global json
- `packages/server/src/modules/auth/auth.controller.ts` — uses `req.body` as Buffer, `wh.verify(rawBody, headers)`, `JSON.parse(rawBody.toString())`

### 2. Request Body Size Limit ✅
`app.use(express.json({ limit: '10mb' }))` — increased from default 100kb.

### 3. GROQ_API_KEY in .env.example ✅
Already present from prior work.

## Pending (needs database provisioned)

### 4. Prisma Migration
Need to run after DB is provisioned:
```bash
cd packages/server && npx prisma migrate dev --name init
```

## Should Fix (Production Hardening)

- `helmet` — security headers
- `express-rate-limit` — brute force protection
- `compression` — gzip responses
