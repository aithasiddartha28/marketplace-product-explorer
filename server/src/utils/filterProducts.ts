import type { Product, ProductFilters, SortOption } from '../types/product'

const getSortValue = (sortBy?: SortOption): SortOption => {
  if (sortBy === 'price-low-high' || sortBy === 'top-rated') {
    return sortBy
  }

  return 'top-rated'
}

export const filterProducts = (
  products: Product[],
  filters: ProductFilters,
): Product[] => {
  const selectedCategories = (filters.categories ?? []).filter(Boolean)
  const normalizedMinPrice = Number.isFinite(filters.minPrice)
    ? filters.minPrice
    : 0
  const normalizedMaxPrice = Number.isFinite(filters.maxPrice)
    ? filters.maxPrice
    : Number.POSITIVE_INFINITY
  const validMinPrice = Math.min(normalizedMinPrice, normalizedMaxPrice)
  const validMaxPrice = Math.max(normalizedMinPrice, normalizedMaxPrice)
  const minRating = Number.isFinite(filters.minRating)
    ? Math.max(0, Math.min(filters.minRating, 5))
    : 0
  const searchTerm = (filters.searchTerm ?? '').trim().toLowerCase()

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category)

    const matchesPrice =
      product.price >= validMinPrice && product.price <= validMaxPrice

    const matchesRating = product.rating >= minRating

    const matchesSearch =
      searchTerm.length === 0 ||
      [product.name, product.category, product.description]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm)

    return matchesCategory && matchesPrice && matchesRating && matchesSearch
  })

  const sortedProducts = [...filteredProducts]

  sortedProducts.sort((a, b) => {
    const sortBy = getSortValue(filters.sortBy)

    if (sortBy === 'price-low-high') {
      return a.price - b.price
    }

    return b.rating - a.rating || a.price - b.price
  })

  return sortedProducts
}
