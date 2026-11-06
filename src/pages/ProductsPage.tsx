import { useState, useMemo } from 'react'
import { Filter, ChevronDown, Heart, Search } from 'lucide-react'
import { ProductCard, type Product } from '../components/ProductCard'

type ExtendedProduct = {
  id: string | number
  nome?: string
  name?: string
  marca?: string
  brand?: string
  categoria?: string
  category?: string
  precoVenda?: number
  price?: number
  precoOriginal?: number
  originalPrice?: number
  descontoPercentual?: number
  discountPercentage?: number
  imagemUrl?: string
  image?: string
  imageUrl?: string
}

type ProductsPageProps = {
  products?: Product[]
  isGerente?: boolean
  onAddToCart: (product: Product) => void
  onEditProduct?: (product: Product) => void
  initialCategory?: string
  initialSearchQuery?: string
  onlyFavorites?: boolean
  favoriteIds?: (string | number)[]
  onToggleFavorite?: (productId: string | number) => void
  onClearFavoritesFilter?: () => void
}

export function ProductsPage({
  products,
  isGerente = false,
  onAddToCart,
  onEditProduct,
  initialCategory,
  initialSearchQuery = '',
  onlyFavorites = false,
  favoriteIds = [],
  onToggleFavorite,
  onClearFavoritesFilter
}: ProductsPageProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc'>('relevance')
  const [isSortOpen, setIsSortOpen] = useState(false)

  const allProducts = useMemo(() => (products ?? []) as unknown as ExtendedProduct[], [products])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(item => item !== cat) : [...prev, cat]
    )
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(item => item !== brand) : [...prev, brand]
    )
  }

  const handlePriceChange = (priceRange: string) => {
    setSelectedPrices(prev =>
      prev.includes(priceRange) ? prev.filter(item => item !== priceRange) : [...prev, priceRange]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedPrices([])
    setSearchQuery('')
  }

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter(product => {
        const prodId = product.id
        const prodName = (product.nome || product.name || '').toLowerCase()
        const prodCat = (product.categoria || product.category || '').toLowerCase()
        const prodBrand = (product.marca || product.brand || '').toLowerCase()
        const prodPrice = product.precoVenda ?? product.price ?? 0

        if (onlyFavorites && !favoriteIds.includes(prodId)) {
          return false
        }

        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase().trim()
          const matchesName = prodName.includes(query)
          const matchesBrand = prodBrand.includes(query)
          if (!matchesName && !matchesBrand) return false
        }

        if (selectedCategories.length > 0) {
          const matchesCategory = selectedCategories.some(cat => {
            const catLower = cat.toLowerCase()

            if (catLower === 'alimentos' && (prodCat.includes('alimento') || prodName.includes('achocolatado') || prodName.includes('macarrão') || prodName.includes('doce') || prodCat.includes('mercearia'))) {
              return true
            }
            if (catLower === 'bebidas' && (prodCat.includes('bebida') || prodName.includes('leite') || prodName.includes('suco') || prodName.includes('refrigerante'))) {
              return true
            }
            if (catLower === 'limpeza' && (prodCat.includes('limpeza') || prodName.includes('detergente') || prodName.includes('sabão') || prodName.includes('desinfetante'))) {
              return true
            }
            if ((catLower === 'higiene e beleza' || catLower === 'higiene') && (prodCat.includes('higiene') || prodName.includes('sabonete') || prodName.includes('shampoo') || prodName.includes('creme'))) {
              return true
            }

            return prodCat.includes(catLower) || prodName.includes(catLower)
          })
          if (!matchesCategory) return false
        }

        if (selectedBrands.length > 0) {
          const matchesBrand = selectedBrands.some(brand =>
            prodBrand.includes(brand.toLowerCase()) || prodName.includes(brand.toLowerCase())
          )
          if (!matchesBrand) return false
        }

        if (selectedPrices.length > 0) {
          const matchesPrice = selectedPrices.some(range => {
            if (range === 'Até R$ 10,00') return prodPrice <= 10
            if (range === 'R$ 10,00 - R$ 20,00') return prodPrice > 10 && prodPrice <= 20
            if (range === 'R$ 20,00 - R$ 50,00') return prodPrice > 20 && prodPrice <= 50
            if (range === 'Acima de R$ 50,00') return prodPrice > 50
            return true
          })
          if (!matchesPrice) return false
        }

        return true
      })
      .sort((a, b) => {
        const priceA = a.precoVenda ?? a.price ?? 0
        const priceB = b.precoVenda ?? b.price ?? 0
        if (sortBy === 'price-asc') return priceA - priceB
        if (sortBy === 'price-desc') return priceB - priceA
        return 0
      })
  }, [allProducts, selectedCategories, selectedBrands, selectedPrices, searchQuery, onlyFavorites, favoriteIds, sortBy])

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl flex items-center gap-2">
            {onlyFavorites ? (
              <>
                <Heart className="text-rose-600 fill-rose-600" size={28} />
                <span>Meus Favoritos</span>
              </>
            ) : (
              <span>Confira nossos melhores preços e variedades!</span>
            )}
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {onlyFavorites
              ? 'Seus produtos salvos com o coração em um só lugar'
              : 'Encontre tudo o que seu comércio precisa no atacado'}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produtos ou marcas..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:w-64 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-[#480404]" />
                <h3 className="text-base font-bold text-slate-900">Filtros</h3>
              </div>
              {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedPrices.length > 0 || searchQuery) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#480404] hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="border-b border-slate-200 pb-4">
              <h4 className="mb-3 text-sm font-bold text-slate-800">Categoria</h4>
              <div className="space-y-2 text-xs font-semibold text-slate-600">
                {['Alimentos', 'Bebidas', 'Higiene e Beleza', 'Limpeza'].map(cat => (
                  <label key={cat} className="flex items-center gap-2.5 cursor-pointer hover:text-[#480404]">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                      className="h-4 w-4 rounded border-slate-300 text-[#480404] focus:ring-[#480404]"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-b border-slate-200 pb-4">
              <h4 className="mb-3 text-sm font-bold text-slate-800">Marca</h4>
              <div className="space-y-2 text-xs font-semibold text-slate-600">
                {['Nestlé', 'Nissin', 'Ypê', 'Italac', 'Adria', 'Omo'].map(brand => (
                  <label key={brand} className="flex items-center gap-2.5 cursor-pointer hover:text-[#480404]">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="h-4 w-4 rounded border-slate-300 text-[#480404] focus:ring-[#480404]"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold text-slate-800">Preço</h4>
              <div className="space-y-2 text-xs font-semibold text-slate-600">
                {[
                  'Até R$ 10,00',
                  'R$ 10,00 - R$ 20,00',
                  'R$ 20,00 - R$ 50,00',
                  'Acima de R$ 50,00'
                ].map(priceRange => (
                  <label key={priceRange} className="flex items-center gap-2.5 cursor-pointer hover:text-[#480404]">
                    <input
                      type="checkbox"
                      checked={selectedPrices.includes(priceRange)}
                      onChange={() => handlePriceChange(priceRange)}
                      className="h-4 w-4 rounded border-slate-300 text-[#480404] focus:ring-[#480404]"
                    />
                    <span>{priceRange}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#480404]">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50"
              >
                <span>
                  {sortBy === 'relevance' && 'Relevância'}
                  {sortBy === 'price-asc' && 'Menor Preço'}
                  {sortBy === 'price-desc' && 'Maior Preço'}
                </span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-slate-100 bg-white py-1 shadow-lg text-xs font-semibold text-slate-700">
                    <button
                      type="button"
                      onClick={() => { setSortBy('relevance'); setIsSortOpen(false) }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 hover:text-[#480404]"
                    >
                      Relevância
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSortBy('price-asc'); setIsSortOpen(false) }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 hover:text-[#480404]"
                    >
                      Menor Preço
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSortBy('price-desc'); setIsSortOpen(false) }}
                      className="w-full px-3 py-2 text-left hover:bg-[#480404] hover:text-white"
                    >
                      Maior Preço
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favoriteIds.includes(product.id)}
                  isGerente={isGerente}
                  onAddToCart={() => onAddToCart(product)}
                  onToggleFavorite={() => onToggleFavorite?.(product.id)}
                  onEdit={() => onEditProduct?.(product)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-3">
                <Heart size={28} className={onlyFavorites ? 'fill-rose-200' : ''} />
              </div>
              <p className="text-base font-bold text-slate-800">
                {onlyFavorites ? 'Nenhum produto favoritado ainda' : 'Nenhum produto encontrado'}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1 max-w-sm">
                {onlyFavorites
                  ? 'Clique no ícone de coração em qualquer produto para salvá-lo como favorito.'
                  : 'Tente selecionar outros filtros ou limpar a busca.'}
              </p>
              {onlyFavorites && onClearFavoritesFilter ? (
                <button
                  type="button"
                  onClick={onClearFavoritesFilter}
                  className="mt-4 rounded-xl bg-[#480404] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#660606] transition-colors shadow-sm"
                >
                  Ver Todos os Produtos
                </button>
              ) : (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-xl bg-[#480404] px-4 py-2 text-xs font-bold text-white hover:bg-[#660606] transition-colors shadow-sm"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}