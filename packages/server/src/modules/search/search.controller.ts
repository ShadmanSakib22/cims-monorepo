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
