import cors from 'cors'
import express, { type Request, type Response } from 'express'

import { products } from './data/products'
import type { ProductFilters, SortOption } from './types/product'
import { filterProducts } from './utils/filterProducts'

const app = express()
const port = Number(process.env.PORT ?? 5000)

app.use(cors())
app.use(express.json())

const getNumberValue = (value: unknown, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const parseCategories = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => parseCategories(item))
  }

  if (typeof value !== 'string') {
    return []
  }

  return value
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean)
}

const parseSortBy = (value: unknown): SortOption => {
  if (value === 'price-low-high' || value === 'top-rated') {
    return value
  }

  return 'top-rated'
}

const getMaxPrice = (): number =>
  products.reduce((max, product) => Math.max(max, product.price), 0)

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/products', (req: Request, res: Response) => {
  const selectedCategories = parseCategories(req.query.categories)
  const minPrice = getNumberValue(req.query.minPrice, 0)
  const maxPrice = getNumberValue(req.query.maxPrice, getMaxPrice())
  const minRating = getNumberValue(req.query.minRating, 0)
  const searchTerm = typeof req.query.search === 'string' ? req.query.search : ''
  const sortBy = parseSortBy(req.query.sortBy)

  const normalizedMin = Math.min(minPrice, maxPrice)
  const normalizedMax = Math.max(minPrice, maxPrice)

  const filters: ProductFilters = {
    categories: selectedCategories,
    minPrice: normalizedMin,
    maxPrice: normalizedMax,
    minRating: Math.max(0, Math.min(minRating, 5)),
    searchTerm,
    sortBy,
  }

  const filtered = filterProducts(products, filters)

  res.json({
    items: filtered,
    total: filtered.length,
    filters,
    maxPriceAvailable: getMaxPrice(),
  })
})

app.listen(port, () => {
  console.log(`Marketplace API running on http://localhost:${port}`)
})
