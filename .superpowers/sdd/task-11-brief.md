### Task 11: Search Module (Groq AI)

**Files:**
- Create: `packages/server/src/modules/search/search.schema.ts`
- Create: `packages/server/src/modules/search/search.service.ts`
- Create: `packages/server/src/modules/search/search.controller.ts`
- Create: `packages/server/src/modules/search/search.routes.ts`

- [ ] **Step 1: Add Groq SDK dependency**

Run: `cd I:\SmartClinic\smart-clinic-scheduler && pnpm --filter @smartclinic/server add groq-sdk`

- [ ] **Step 2: Create `packages/server/src/modules/search/search.schema.ts`**

```typescript
import { z } from 'zod'

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(500),
})
```

- [ ] **Step 3: Create `packages/server/src/modules/search/search.service.ts`**

```typescript
import prisma from '@/core/prisma.js'
import logger from '@/core/logger.js'

const SYSTEM_PROMPT = `You are a medical database query assistant. Convert natural language questions into structured JSON queries for a clinic management system.

Available entities and fields for querying:
- Patient: name, email, phone, dateOfBirth, gender, bloodGroup
- Appointment: date, status (BOOKED, CONFIRMED, CHECKED_IN, WAITING, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW), type (REGULAR, WALK_IN, FOLLOW_UP)
- Doctor: specialty, name (via user relation)
- Consultation: diagnosis, chiefComplaint, createdAt, finalizeAt
- Prescription: medicineName, strength, dosage, frequency
- Document: category (PRESCRIPTION, LAB_REPORT, IMAGING, etc.), fileName

Response must be valid JSON only, with this structure:
{
  "entity": "Patient" | "Appointment" | "Doctor" | "Consultation" | "Prescription" | "Document",
  "filters": { "field": "value or operator object" },
  "include": ["related entity names"],
  "orderBy": { "field": "asc" | "desc" },
  "explanation": "Brief explanation of what was queried"
}

For date comparisons use: { "gte": "ISO date", "lte": "ISO date" }
For text search use: { "contains": "text", "mode": "insensitive" }

Only generate queries that read data. Never generate mutations.
If the query is unclear or cannot be mapped to the available schema, respond with { "error": "explanation" }.`

export async function searchWithAI(naturalQuery: string) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured')
  }

  try {
    const { default: Groq } = await import('groq-sdk')
    const groq = new Groq({ apiKey })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: naturalQuery },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      return { error: 'AI did not return a response' }
    }

    const parsedQuery = JSON.parse(responseText)

    if (parsedQuery.error) {
      return { error: parsedQuery.error }
    }

    const results = await executeQuery(parsedQuery)
    return {
      query: parsedQuery,
      results,
      explanation: parsedQuery.explanation,
    }
  } catch (err: any) {
    logger.error({ err }, 'AI search failed')
    return { error: err.message || 'Search failed' }
  }
}

async function executeQuery(parsedQuery: any) {
  const { entity, filters = {}, include = [], orderBy = {} } = parsedQuery

  const prismaInclude: any = {}
  for (const relation of include) {
    if (relation === 'doctor') {
      prismaInclude.doctor = { include: { user: { select: { name: true } } } }
    } else if (relation === 'patient') {
      prismaInclude.patient = { include: { user: { select: { name: true, phone: true } } } }
    } else if (relation === 'consultation') {
      prismaInclude.consultation = { select: { id: true, status: true, diagnosis: true } }
    }
  }

  const orderByObj: any = {}
  for (const [field, dir] of Object.entries(orderBy)) {
    orderByObj[field] = dir
  }

  const entityMap: Record<string, any> = {
    Patient: prisma.patient,
    Appointment: prisma.appointment,
    Doctor: prisma.doctor,
    Consultation: prisma.consultation,
    Prescription: prisma.prescription,
    Document: prisma.document,
  }

  const model = entityMap[entity]
  if (!model) return []

  return model.findMany({
    where: filters,
    include: prismaInclude,
    orderBy: Object.keys(orderByObj).length > 0 ? orderByObj : undefined,
    take: 50,
  })
}
```

- [ ] **Step 4: Create `packages/server/src/modules/search/search.controller.ts`**

```typescript
import type { Request, Response, NextFunction } from 'express'
import { searchWithAI } from './search.service.js'
import { searchQuerySchema } from './search.schema.js'

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const { query } = searchQuerySchema.parse(req.body)
    const result = await searchWithAI(query)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
```

- [ ] **Step 5: Create `packages/server/src/modules/search/search.routes.ts`**

```typescript
import { Router } from 'express'
import { requireAuth } from '@/core/clerk.js'
import { search } from './search.controller.js'

const router = Router()

router.post('/search', requireAuth, search)

export default router
```

NOTE: Do NOT register routes in app.ts — Task 7 handles all route registration.
