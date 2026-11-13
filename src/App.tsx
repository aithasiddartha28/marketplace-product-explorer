import { useCallback, useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  Filter,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
} from 'lucide-react'

type SortOption = 'price-low-high' | 'top-rated'

type Product = {
  id: number
  name: string
  category: string
  price: number
  rating: number
  image: string
  description: string
}

type CartItem = {
  product: Product
  quantity: number
}

const categoryOptions = [
  'Electronics',
  'Apparel',
  'Footwear',
  'Home & Kitchen',
  'Accessories',
  'Beauty',
]

const ratingOptions = [
  { value: 0, label: 'Any Rating' },
  { value: 1, label: '1 Star & Above' },
  { value: 2, label: '2 Stars & Above' },
  { value: 3, label: '3 Stars & Above' },
  { value: 4, label: '4 Stars & Above' },
  { value: 5, label: '5 Stars' },
]

const FALLBACK_IMAGE = '/product-placeholder.svg'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

const renderStars = (rating: number) => (
  <div className="flex items-center gap-1 text-amber-400">
    {Array.from({ length: 5 }, (_, index) => {
      const isFilled = index < Math.round(rating)

      return (
        <Star
          key={`${rating}-${index}`}
          className={`h-4 w-4 ${
            isFilled ? 'fill-current text-amber-400' : 'text-slate-300'
          }`}
        />
      )
    })}
    <span className="ml-1 text-sm font-semibold text-slate-600">
      {rating.toFixed(1)}
    </span>
  </div>
)

function App() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState(500)
  const [maxPrice, setMaxPrice] = useState(70000)
  const [minRating, setMinRating] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('top-rated')
  const [products, setProducts] = useState<Product[]>([])
  const [loadError, setLoadError] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isBagOpen, setIsBagOpen] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const bagItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const bagSubtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  )

  const handleAddToBag = (product: Product) => {
    setCartItems((current) => {
      const existingItem = current.find((item) => item.product.id === product.id)

      if (existingItem) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...current, { product, quantity: 1 }]
    })
    setRecentlyAdded(product.name)
  }

  const handleQuantityChange = (productId: number, change: number) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + change }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const handleRemoveFromBag = (productId: number) => {
    setCartItems((current) =>
      current.filter((item) => item.product.id !== productId),
    )
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    )
  }

  const handleResetFilters = () => {
    setSelectedCategories([])
    setMinPrice(500)
    setMaxPrice(70000)
    setMinRating(0)
    setSearchTerm('')
    setSortBy('top-rated')
  }

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams()

    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','))
    }

    params.set('minPrice', String(minPrice))
    params.set('maxPrice', String(maxPrice))
    params.set('minRating', String(minRating))

    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim())
    }

    params.set('sortBy', sortBy)

    setIsLoading(true)
    setLoadError('')

    try {
      const response = await fetch(`/api/products?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Unable to load products')
      }

      const data = await response.json()
      setProducts(Array.isArray(data.items) ? data.items : [])
    } catch (error) {
      console.error(error)
      setLoadError('We could not load products. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategories, minPrice, maxPrice, minRating, searchTerm, sortBy])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchProducts()
    }, 180)

    return () => window.clearTimeout(timeoutId)
  }, [fetchProducts])

  useEffect(() => {
    if (!recentlyAdded) {
      return
    }

    const timeoutId = window.setTimeout(() => setRecentlyAdded(''), 2400)
    return () => window.clearTimeout(timeoutId)
  }, [recentlyAdded])

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-soft">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                Marketplace
              </p>
              <h1 className="text-lg font-bold text-slate-900">Horizon Cart</h1>
            </div>
          </div>

          <div className="hidden min-w-[300px] items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 sm:flex">
            <Search className="h-4 w-4" />
            <input
              type="search"
              placeholder="Search products, categories, or style"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 md:flex md:items-center md:gap-2">
              <SlidersHorizontal className="h-4 w-4 text-orange-500" />
              {products.length} items
            </div>
            <button
              type="button"
              onClick={() => setIsBagOpen(true)}
              aria-label={`Open shopping bag, ${bagItemCount} items`}
              className="relative inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
                {bagItemCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsFilterOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm lg:hidden"
            >
              <Filter className="h-4 w-4 text-orange-500" />
              Filters
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-500">
              Better choices
            </p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              Discover your next favorite product
            </h2>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="appearance-none border-0 bg-transparent font-medium text-slate-700 outline-none"
              >
                <option value="top-rated">Top Rated First</option>
                <option value="price-low-high">Price: Low to High</option>
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside
            className={`${
              isFilterOpen ? 'block' : 'hidden'
              } rounded-3xl border border-slate-200 bg-white p-5 shadow-soft lg:sticky lg:top-24 lg:block lg:self-start`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Filters
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">Refine results</h3>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Reset
              </button>
            </div>

            <div className="space-y-6">
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Category
                  </h4>
                </div>

                <div className="space-y-2">
                  {categoryOptions.map((category) => (
                    <label
                      key={category}
                      className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-orange-200 hover:bg-orange-50"
                    >
                      <span className="text-sm font-medium text-slate-700">{category}</span>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Price range
                  </h4>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-4 flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{formatCurrency(minPrice)}</span>
                    <span className="text-slate-400">-</span>
                    <span>{formatCurrency(maxPrice)}</span>
                  </div>

                  <div className="relative mt-3 h-10">
                    <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
                    <div
                      className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-orange-500"
                      style={{
                        left: `${((minPrice - 500) / (70000 - 500)) * 100}%`,
                        width: `${((maxPrice - minPrice) / (70000 - 500)) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={500}
                      max={70000}
                      step={50}
                      value={minPrice}
                      onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice))}
                      className="range-input"
                    />
                    <input
                      type="range"
                      min={500}
                      max={70000}
                      step={50}
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice))}
                      className="range-input z-10"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Minimum rating
                  </h4>
                </div>

                <div className="space-y-2">
                  {ratingOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
                        minRating === option.value
                          ? 'border-orange-200 bg-orange-50 text-orange-700'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === option.value}
                        onChange={() => setMinRating(option.value)}
                        className="h-4 w-4 border-slate-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {option.value === 0 ? (
                          <span className="text-sm">Any Rating</span>
                        ) : (
                          <>
                            {Array.from({ length: Math.min(option.value, 5) }, (_, index) => (
                              <Star key={`${option.value}-${index}`} className="h-3.5 w-3.5 fill-current" />
                            ))}
                            <span>{option.label}</span>
                          </>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-medium text-slate-600">
                Showing <span className="font-bold text-slate-900">{products.length}</span> items
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
                Reset filters
              </button>
            </div>

            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="h-52 w-full bg-slate-200" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-20 rounded-full bg-slate-200" />
                      <div className="h-6 w-3/4 rounded bg-slate-200" />
                      <div className="h-4 w-1/2 rounded bg-slate-200" />
                      <div className="h-20 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div
                role="alert"
                className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-rose-200 bg-white px-6 py-12 text-center shadow-sm"
              >
                <p className="text-xl font-semibold text-slate-800">{loadError}</p>
                <button
                  type="button"
                  onClick={() => void fetchProducts()}
                  className="mt-4 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Try again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-xl font-semibold text-slate-800">No items match your criteria.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() => handleAddToBag(product)}
                    aria-label={`Add ${product.name} to bag`}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_IMAGE
                        }}
                      />
                    </div>

                    <div className="space-y-4 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-600">
                          {product.category}
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          {formatCurrency(product.price)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                        {renderStars(product.rating)}
                      </div>

                      <p className="text-sm leading-6 text-slate-600">{product.description}</p>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition group-hover:bg-orange-500">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Add to bag
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {recentlyAdded ? (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          <Check className="h-4 w-4 text-emerald-400" />
          {recentlyAdded} added to bag
          <button
            type="button"
            onClick={() => {
              setIsBagOpen(true)
              setRecentlyAdded('')
            }}
            className="ml-1 font-bold text-orange-300 underline underline-offset-2"
          >
            View bag
          </button>
        </div>
      ) : null}

      {isBagOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40"
          onClick={() => setIsBagOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="bag-title"
            className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 id="bag-title" className="text-xl font-bold text-slate-900">
                  Your shopping bag
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {bagItemCount} {bagItemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBagOpen(false)}
                aria-label="Close shopping bag"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <ShoppingBag className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Your bag is empty
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Tap a product to add it to your bag.
                </p>
                <button
                  type="button"
                  onClick={() => setIsBagOpen(false)}
                  className="mt-5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {cartItems.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex gap-4 rounded-2xl border border-slate-200 p-3"
                    >
                      <img
                        src={product.image}
                        alt=""
                        className="h-24 w-20 rounded-xl bg-slate-100 object-cover"
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_IMAGE
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                              {product.category}
                            </p>
                            <h3 className="mt-1 font-semibold text-slate-900">
                              {product.name}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromBag(product.id)}
                            aria-label={`Remove ${product.name} from bag`}
                            className="rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(product.id, -1)}
                              aria-label={`Decrease ${product.name} quantity`}
                              className="rounded-l-full p-1.5 text-slate-600 transition hover:bg-slate-100"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(product.id, 1)}
                              aria-label={`Increase ${product.name} quantity`}
                              className="rounded-r-full p-1.5 text-slate-600 transition hover:bg-slate-100"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(product.price * quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatCurrency(bagSubtotal)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsBagOpen(false)}
                    className="mt-4 w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                  >
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default App
