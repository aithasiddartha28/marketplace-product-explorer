export type ProductCategory =
  | 'Electronics'
  | 'Apparel'
  | 'Footwear'
  | 'Home & Kitchen'
  | 'Accessories'
  | 'Beauty'

export type SortOption = 'price-low-high' | 'top-rated'

export interface Product {
  id: number
  name: string
  category: ProductCategory
  price: number
  rating: number
  image: string
  description: string
}

export interface ProductFilters {
  categories: string[]
  minPrice: number
  maxPrice: number
  minRating: number
  searchTerm?: string
  sortBy?: SortOption
}
