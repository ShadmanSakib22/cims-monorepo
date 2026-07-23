# Code Review Fix Report

## Status: DONE

## What Was Fixed

### C1 — JWT signature verification bypass (CRITICAL)
- **Files:** `packages/server/src/core/clerk.ts`, `packages/server/src/core/socket.ts`
- Installed `@clerk/clerk-sdk-node` and replaced manual base64 JWT decode with `clerkClient.verifyToken()`
- Converted `requireAuth`/`optionalAuth` from `.then()` chaining to async/await with try/catch
- Removed the `parseJwt` function entirely
- Socket auth middleware now uses Clerk's `verifyToken` instead of manual base64 decode

### C2 — cancelAppointment discards the cancel reason (CRITICAL)
- **File:** `packages/server/src/modules/appointments/appointments.service.ts`
- `updateAppointmentStatus` now accepts an optional `cancelReason` parameter
- When status is `CANCELLED`, sets `cancelledAt` and optionally `cancelReason`
- `cancelAppointment` now passes `data.reason` through

### C3 — Consultation revision does not preserve labOrders/imagingOrders (CRITICAL)
- **File:** `packages/server/src/modules/consultations/consultations.service.ts`
- Added `labOrders` and `imagingOrders` to the revision creation data

### I2 — AI search filter whitelist (IMPORTANT)
- **File:** `packages/server/src/modules/search/search.service.ts`
- Added `ALLOWED_FILTERS` whitelist per entity to prevent injection via AI-generated filters
- Changed `groq-sdk` import from dynamic `await import()` to static `import Groq from 'groq-sdk'`

### I3 — Duplicate room join logic (IMPORTANT)
- **File:** `packages/server/src/core/socket.ts`
- Removed `join:doctor-queue` and `join:reception` client event handlers (queue gateway handles this automatically)

### I4 — No role guard on appointment booking (IMPORTANT)
- **File:** `packages/server/src/modules/appointments/appointments.routes.ts`
- Added `requireRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')` to POST `/appointments`

### I5 — Dead labOrderSchema/imagingOrderSchema (IMPORTANT)
- **File:** `packages/server/src/modules/consultations/consultations.schema.ts`
- Removed unused `labOrderSchema` and `imagingOrderSchema`

### I6 — Double as string cast (IMPORTANT)
- **File:** `packages/server/src/modules/consultations/consultations.controller.ts`
- Fixed `req.params.id as string as string` to `req.params.id as string`

### I7 — Missing consultation list endpoint (IMPORTANT)
- **Files:** `packages/server/src/modules/consultations/consultations.service.ts`, `consultations.controller.ts`, `consultations.routes.ts`
- Added `listConsultations` service with pagination and optional patientId/doctorId filtering
- Added `list` controller handler
- Added `GET /consultations` route

## Typecheck Result

`npx tsc --noEmit` in `packages/server` — **passed** (no errors).

## Commit SHA

`03f33f4`

## Remaining Concerns

None.
