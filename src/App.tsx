import { useCallback, useEffect, useState } from 'react'
import { Flame, Sparkles, Loader2, AlertCircle, Lock } from 'lucide-react'
import { Header } from './components/Header'
import { HeroBanner } from './components/HeroBanner'
import { ProductCard, type Product } from './components/ProductCard'
import { LoginModal } from './components/LoginModal'
import { RegisterPage } from './components/RegisterPage'
import { RegisterNoticeModal } from './components/RegisterNoticeModal'
import { ProductsPage } from './components/ProductsPage'
import { CartPage, type CartItem } from './components/CartPage'
import { CheckoutModal } from './components/CheckoutModal'
import { ProfilePage } from './components/ProfilePage'
import { OrdersPage, type Order, type OrderItem } from './components/OrdersPage'
import { AdminPage } from './components/AdminPage'
import { ProductFormModal } from './components/ProductFormModal'
import { ApiError, mensagemDeErro, setUnauthorizedHandler } from './services/api'
import { authService, type AuthUser, type RegisterData } from './services/auth'
import { produtosService } from './services/produtos'
import { pedidosService, type FormaPagamento } from './services/pedidos'

type View = 'home' | 'register' | 'products' | 'cart' | 'profile' | 'orders' | 'admin'

function StatusMessage({
  tipo,
  texto,
  onRetry
}: {
  tipo: 'loading' | 'error' | 'info'
  texto: string
  onRetry?: () => void
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-16 text-center">
      {tipo === 'loading' && <Loader2 className="animate-spin text-[#480404]" size={32} />}
      {tipo === 'error' && <AlertCircle className="text-rose-600" size={32} />}
      {tipo === 'info' && <Lock className="text-slate-400" size={32} />}
      <p className="text-sm font-semibold text-slate-700">{texto}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-[#480404] px-4 py-2 text-xs font-bold text-white hover:bg-[#660606]"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home')

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>(undefined)
  const [onlyFavoritesFilter, setOnlyFavoritesFilter] = useState<boolean>(false)
  const [searchQueryFilter, setSearchQueryFilter] = useState<string | undefined>(undefined)

  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isAuthNoticeOpen, setIsAuthNoticeOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // Edição direta via modal (gerente, a partir do card)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProductFromCard, setEditingProductFromCard] = useState<Product | null>(null)

  // Catálogo (vindo da API)
  const [productsList, setProductsList] = useState<Product[]>([])
  const [topProducts, setTopProducts] = useState<Product[] | null>(null)
  const [offerProducts, setOfferProducts] = useState<Product[] | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')

  // Sessão
  const [user, setUser] = useState<AuthUser | null>(null)
  const userId = user?.id

  const [favoriteIds, setFavoriteIds] = useState<(string | number)[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Pedidos (vindos da API)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  const [toast, setToast] = useState('')

  // O papel vem do servidor (token validado a cada requisição); aqui só controla a interface.
  const isGerente = user?.role === 'gerente'

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast((atual) => (atual === msg ? '' : atual)), 4000)
  }, [])

  // ---------- CATÁLOGO ----------
  const carregarCatalogo = useCallback(async (silencioso = false) => {
    if (!silencioso) setCatalogLoading(true)
    setCatalogError('')
    try {
      const [todos, top, ofertas] = await Promise.all([
        produtosService.listar(),
        produtosService.maisVendidos().catch(() => null),
        produtosService.ofertas().catch(() => null)
      ])
      setProductsList(todos)
      setTopProducts(top)
      setOfferProducts(ofertas)
    } catch (e) {
      setCatalogError(mensagemDeErro(e, 'Não foi possível carregar os produtos.'))
    } finally {
      setCatalogLoading(false)
    }
  }, [])

  useEffect(() => {
    // Busca inicial de dados da API (padrão "carregar ao montar")
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregarCatalogo()
  }, [carregarCatalogo])

  // ---------- SESSÃO ----------
  // Restaura o login ao recarregar a página (token salvo + GET /auth/me)
  useEffect(() => {
    let ativo = true
    void authService.restaurarSessao().then((u) => {
      if (ativo && u) setUser(u)
    })
    return () => {
      ativo = false
    }
  }, [])

  // Token expirado/inválido em qualquer chamada => volta para o login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      setOrders([])
      setCartItems([])
      setFavoriteIds([])
      setCurrentView('home')
      setIsLoginOpen(true)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  // Favoritos ficam salvos por usuário neste navegador
  useEffect(() => {
    if (!userId) return
    try {
      const salvo = localStorage.getItem(`imma_fav_${userId}`)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFavoriteIds(salvo ? (JSON.parse(salvo) as (string | number)[]) : [])
    } catch {
      setFavoriteIds([])
    }
  }, [userId])

  // ---------- PEDIDOS ----------
  const carregarPedidos = useCallback(async () => {
    if (!userId) return
    setOrdersLoading(true)
    setOrdersError('')
    try {
      setOrders(await pedidosService.listarDoCliente(userId))
    } catch (e) {
      setOrdersError(mensagemDeErro(e, 'Não foi possível carregar seus pedidos.'))
    } finally {
      setOrdersLoading(false)
    }
  }, [userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (currentView === 'orders' && userId) void carregarPedidos()
  }, [currentView, userId, carregarPedidos])

  // ---------- CRUD DE PRODUTOS (gerente) ----------
  // Os handlers devolvem a Promise: os modais só fecham se a API confirmar e exibem o erro se falhar.
  const handleOpenEditFromCard = (product: Product) => {
    setEditingProductFromCard(product)
    setIsEditModalOpen(true)
  }

  const handleAddProduct = async (newProd: Partial<Product>) => {
    await produtosService.criar(newProd)
    await carregarCatalogo(true)
    showToast('Produto cadastrado com sucesso!')
  }

  const handleUpdateProduct = async (updatedProd: Partial<Product>) => {
    if (updatedProd.id === undefined) throw new Error('Produto sem identificador.')
    await produtosService.atualizar(updatedProd.id, updatedProd)
    await carregarCatalogo(true)
    showToast('Produto atualizado com sucesso!')
  }

  const handleDeleteProduct = async (id: string | number) => {
    try {
      await produtosService.remover(id)
      await carregarCatalogo(true)
      showToast('Produto removido com sucesso!')
    } catch (e) {
      showToast(mensagemDeErro(e, 'Não foi possível remover o produto.'))
    }
  }

  // ---------- FAVORITOS ----------
  const handleToggleFavorite = (productId: string | number) => {
    if (!user) {
      setIsAuthNoticeOpen(true)
      return
    }
    setFavoriteIds((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      try {
        localStorage.setItem(`imma_fav_${user.id}`, JSON.stringify(next))
      } catch {
        /* armazenamento indisponível */
      }
      return next
    })
  }

  // ---------- CARRINHO ----------
  const addProductToCart = (product: Product, quantidade = 1): boolean => {
    const idStr = String(product.id)
    const estoque = product.estoqueFisico
    const noCarrinho = cartItems.find((i) => i.id === idStr)?.quantidade ?? 0

    if (estoque !== undefined && noCarrinho + quantidade > estoque) {
      showToast(
        estoque <= 0
          ? 'Produto indisponível no momento.'
          : `Estoque máximo atingido: restam ${estoque} unidade(s) deste produto.`
      )
      return false
    }

    const nome = product.nome || product.name || 'Produto'
    const precoVenda = product.precoVenda ?? product.price ?? 0
    const precoOriginal = product.precoOriginal ?? product.originalPrice
    const marca = product.marca || product.brand || 'IMMA'
    const descontoPercentual = product.descontoPercentual ?? product.discountPercentage
    const imagemUrl = product.imagemUrl || product.image || product.imageUrl

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === idStr)
      if (existingIndex > -1) {
        return prevItems.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantidade: item.quantidade + quantidade, estoqueFisico: estoque }
            : item
        )
      }
      return [
        ...prevItems,
        {
          id: idStr,
          nome,
          marca,
          precoOriginal,
          precoVenda,
          descontoPercentual,
          imagemUrl,
          quantidade,
          estoqueFisico: estoque
        }
      ]
    })
    return true
  }

  const handleAddToCart = (product: Product) => {
    if (!user) {
      setIsAuthNoticeOpen(true)
      return
    }
    addProductToCart(product)
  }

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = cartItems.find((i) => i.id === id)
    if (item && delta > 0 && item.estoqueFisico !== undefined && item.quantidade + delta > item.estoqueFisico) {
      showToast(`Estoque máximo atingido: restam ${item.estoqueFisico} unidade(s) deste produto.`)
      return
    }
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const novaQtd = i.quantidade + delta
            return novaQtd > 0 ? { ...i, quantidade: novaQtd } : null
          }
          return i
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  // ---------- AUTENTICAÇÃO (API) ----------
  const handleLogin = async (email: string, senha: string) => {
    const u = await authService.login(email, senha)
    setUser(u)
    setIsLoginOpen(false)
  }

  const handleRegister = async (data: RegisterData) => {
    const u = await authService.registrar(data)
    setUser(u)
    setCurrentView('home')
    showToast('Cadastro realizado com sucesso! Você já está logado.')
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setFavoriteIds([])
    setCartItems([])
    setOrders([])
    setCurrentView('home')
  }

  const handleUpdateProfile = async (dados: { nome?: string; telefone?: string }) => {
    setUser(await authService.atualizarPerfil(dados))
  }

  // ---------- NAVEGAÇÃO ----------
  const handleNavigateHome = () => {
    setOnlyFavoritesFilter(false)
    setSelectedCategoryFilter(undefined)
    setSearchQueryFilter(undefined)
    setCurrentView('home')
  }

  const handleNavigateToProducts = (category?: string, search?: string) => {
    setOnlyFavoritesFilter(false)
    setSelectedCategoryFilter(category)
    setSearchQueryFilter(search)
    setCurrentView('products')
  }

  const handleNavigateToFavorites = () => {
    setOnlyFavoritesFilter(true)
    setSelectedCategoryFilter(undefined)
    setCurrentView('products')
  }

  // ---------- CHECKOUT & PEDIDOS ----------
  const handleCheckout = () => {
    if (!user) {
      setIsAuthNoticeOpen(true)
      return
    }
    setIsCheckoutOpen(true)
  }

  // O servidor valida estoque, calcula frete/total e baixa o estoque (tudo numa transação).
  const handleConfirmOrder = async (paymentMethod: FormaPagamento): Promise<Order> => {
    try {
      const pedido = await pedidosService.criar(cartItems, paymentMethod, user?.enderecos[0]?.id)
      setOrders((prev) => [pedido, ...prev])
      setCartItems([])
      void carregarCatalogo(true) // estoque mudou
      return pedido
    } catch (e) {
      if (e instanceof ApiError && (e.status === 409 || e.status === 400)) void carregarCatalogo(true)
      throw e
    }
  }

  // "Comprar novamente": usa o produto ATUAL do catálogo (preço e estoque de hoje), não o do pedido antigo
  const handleReorder = (orderItems: OrderItem[]) => {
    let indisponiveis = 0
    orderItems.forEach((item) => {
      const produto = productsList.find((p) => String(p.id) === String(item.id))
      if (!produto || (produto.estoqueFisico !== undefined && produto.estoqueFisico <= 0)) {
        indisponiveis++
        return
      }
      const max = produto.estoqueFisico ?? item.quantidade
      addProductToCart(produto, Math.min(item.quantidade, max))
    })
    if (indisponiveis > 0) showToast(`${indisponiveis} item(ns) não estão mais disponíveis e não foram adicionados.`)
    setCurrentView('cart')
  }

  const cartTotal = cartItems.reduce((acc, item) => acc + item.precoVenda * item.quantidade, 0)

  // ---------- VITRINE ----------
  const destaques = topProducts ?? productsList.slice(0, 6)
  const ofertas = offerProducts ?? productsList.filter((p) => (p.descontoPercentual ?? 0) > 0).slice(0, 6)

  const renderCard = (product: Product, prefix = '') => (
    <ProductCard
      key={`${prefix}${product.id}`}
      product={product}
      isFavorite={favoriteIds.includes(product.id)}
      isGerente={isGerente}
      onAddToCart={() => handleAddToCart(product)}
      onToggleFavorite={() => handleToggleFavorite(product.id)}
      onEdit={() => handleOpenEditFromCard(product)}
    />
  )

  const catalogoIndisponivel = catalogLoading && productsList.length === 0
  const catalogoComErro = !!catalogError && productsList.length === 0

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header
        user={user}
        cartTotal={cartTotal}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
        onNavigateHome={handleNavigateHome}
        onOpenAuthNotice={() => setCurrentView('cart')}
        onNavigateToProducts={handleNavigateToProducts}
        onNavigateToProfile={() => setCurrentView('profile')}
        onNavigateToOrders={() => setCurrentView('orders')}
        onNavigateToFavorites={handleNavigateToFavorites}
        onNavigateToAdmin={() => setCurrentView('admin')}
      />

      {/* Página Inicial */}
      {currentView === 'home' && (
        <main className="mx-auto max-w-7xl p-4 sm:p-6 space-y-8">
          <HeroBanner />

          {catalogoIndisponivel && <StatusMessage tipo="loading" texto="Carregando produtos..." />}
          {catalogoComErro && (
            <StatusMessage tipo="error" texto={catalogError} onRetry={() => void carregarCatalogo()} />
          )}
          {!catalogLoading && !catalogError && productsList.length === 0 && (
            <StatusMessage tipo="info" texto="Nenhum produto cadastrado ainda." />
          )}

          {destaques.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-rose-600" />
                  <h3 className="text-base font-bold text-slate-900">Produtos mais vendidos</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigateToProducts()}
                  className="text-xs font-bold text-[#480404] hover:underline focus:outline-none"
                >
                  Ver mais
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {destaques.map((product) => renderCard(product))}
              </div>
            </section>
          )}

          {ofertas.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">Ofertas da Semana</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigateToProducts()}
                  className="text-xs font-bold text-[#480404] hover:underline focus:outline-none"
                >
                  Ver mais
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {ofertas.map((product) => renderCard(product, 'oferta-'))}
              </div>
            </section>
          )}
        </main>
      )}

      {/* Catálogo Geral & Favoritos */}
      {currentView === 'products' &&
        (catalogoIndisponivel ? (
          <StatusMessage tipo="loading" texto="Carregando produtos..." />
        ) : catalogoComErro ? (
          <StatusMessage tipo="error" texto={catalogError} onRetry={() => void carregarCatalogo()} />
        ) : (
          <ProductsPage
            key={`${selectedCategoryFilter || 'all'}-${onlyFavoritesFilter}`}
            products={productsList}
            isGerente={isGerente}
            initialCategory={selectedCategoryFilter}
            initialSearchQuery={searchQueryFilter}
            onlyFavorites={onlyFavoritesFilter}
            favoriteIds={favoriteIds}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            onEditProduct={handleOpenEditFromCard}
            onClearFavoritesFilter={() => setOnlyFavoritesFilter(false)}
          />
        ))}

      {/* Página de Cadastro */}
      {currentView === 'register' && (
        <RegisterPage onBackToHome={handleNavigateHome} onSubmitRegister={handleRegister} />
      )}

      {/* Carrinho de Compras */}
      {currentView === 'cart' && (
        <CartPage
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={() => setCartItems([])}
          onContinueShopping={handleNavigateHome}
          onCheckout={handleCheckout}
        />
      )}

      {/* Perfil do Usuário */}
      {currentView === 'profile' &&
        (user ? (
          <ProfilePage
            user={user}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateProfile}
            onChangePassword={authService.alterarSenha}
          />
        ) : (
          <StatusMessage tipo="info" texto="Faça login para ver seu perfil." />
        ))}

      {/* Minhas Compras */}
      {currentView === 'orders' &&
        (!user ? (
          <StatusMessage tipo="info" texto="Faça login para ver suas compras." />
        ) : ordersLoading && orders.length === 0 ? (
          <StatusMessage tipo="loading" texto="Carregando seus pedidos..." />
        ) : ordersError ? (
          <StatusMessage tipo="error" texto={ordersError} onRetry={() => void carregarPedidos()} />
        ) : (
          <OrdersPage
            orders={orders}
            onBackToHome={handleNavigateHome}
            onNavigateToProducts={() => handleNavigateToProducts()}
            onReorder={handleReorder}
          />
        ))}

      {/* Painel do Gerente (a API também bloqueia quem não for gerente) */}
      {currentView === 'admin' &&
        (isGerente ? (
          <AdminPage
            products={productsList}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onBackToHome={handleNavigateHome}
          />
        ) : (
          <StatusMessage tipo="info" texto="Acesso restrito ao gerente." />
        ))}

      {/* Modais */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        onOpenRegister={() => {
          setIsLoginOpen(false)
          setCurrentView('register')
        }}
      />

      <RegisterNoticeModal
        isOpen={isAuthNoticeOpen}
        onClose={() => setIsAuthNoticeOpen(false)}
        onGoToAuth={() => {
          setIsAuthNoticeOpen(false)
          setIsLoginOpen(true)
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        address={user?.enderecos[0] ?? null}
        onConfirmOrder={handleConfirmOrder}
        onFinish={() => setCurrentView('orders')}
      />

      {/* Modal de Edição Rápida de Produto (Disparado pelo Gerente nos Cards) */}
      <ProductFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateProduct}
        productToEdit={editingProductFromCard}
      />

      {/* Aviso rápido (substitui os alert() de sucesso) */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
