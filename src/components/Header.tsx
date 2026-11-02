import { useState } from 'react'
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Package,
  Heart,
  ShieldCheck,
  Wine,
  Sparkles,
  SprayCan,
  ShoppingBag,
  Cookie,
  Utensils,
  ChevronUp,
  ChevronRight,
  Menu,
  MapPin
} from 'lucide-react'

type HeaderProps = {
  user?: { email: string; nome?: string; role?: string } | null
  cartTotal?: number
  onLogout?: () => void
  onOpenLogin?: () => void
  onNavigateHome?: () => void
  onOpenAuthNotice?: () => void
  onNavigateToProducts?: (category?: string, search?: string) => void
  onNavigateToProfile?: () => void
  onNavigateToOrders?: () => void
  onNavigateToFavorites?: () => void
  onNavigateToAdmin?: () => void
}

export function Header({
  user,
  cartTotal = 0,
  onLogout,
  onOpenLogin,
  onNavigateHome,
  onOpenAuthNotice,
  onNavigateToProducts,
  onNavigateToProfile,
  onNavigateToOrders,
  onNavigateToFavorites,
  onNavigateToAdmin
}: HeaderProps) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isGerente = user?.role === 'gerente'

  const categories = [
    { name: 'Bebidas', slug: 'bebidas', icon: Wine },
    { name: 'Higiene e Beleza', slug: 'higiene', icon: Sparkles },
    { name: 'Limpeza', slug: 'limpeza', icon: SprayCan },
    { name: 'Mercearia', slug: 'mercearia', icon: ShoppingBag },
    { name: 'Doces', slug: 'doces', icon: Cookie },
    { name: 'Utilitários', slug: 'utilitarios', icon: Utensils }
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onNavigateToProducts?.(undefined, searchQuery) // <-- ENVIA A PESQUISA PARA O CATÁLOGO
    } else {
      onNavigateToProducts?.()
    }
  }

  return (
    <header className="relative w-full bg-[#480404] text-white">
      {/* Topo do Header */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        
        {/* Logo IMMA Atacadista */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-1 text-left focus:outline-none"
        >
          <span className="text-2xl font-black italic tracking-tighter text-white">IMMA</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-200">
            atacadista
          </span>
        </button>

        {/* Barra de Busca */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produtos, marcas e etc..."
            className="w-full rounded-full bg-white py-2 pl-4 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </button>
        </form>

        {/* Carrinho e Minha Conta */}
        <div className="flex items-center gap-6">
          
          {/* Botão Atalho Gerente */}
          {isGerente && (
            <button
              type="button"
              onClick={onNavigateToAdmin}
              className="hidden lg:flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 transition-all"
            >
              <ShieldCheck size={16} />
              <span>Painel Gerente</span>
            </button>
          )}

          {/* Carrinho Dinâmico */}
          <div
            onClick={onOpenAuthNotice}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <ShoppingCart size={24} />
            <div className="text-xs">
              <span className="block text-slate-300">Carrinho</span>
              <span className="font-bold">
                R$ {cartTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Área do Usuário */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity focus:outline-none rounded-lg p-1 hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 font-bold text-xs">
                  {user.nome ? user.nome.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs">
                  <span className="block font-bold text-white max-w-[120px] truncate">
                    Olá, {user.nome || user.email.split('@')[0]}!
                  </span>
                  <span className="text-slate-300 text-[11px] flex items-center gap-1 font-medium">
                    Minha conta {isUserMenuOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </span>
                </div>
              </button>

              {/* POP-UP MINHA CONTA */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsUserMenuOpen(false)}
                  />

                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl bg-[#480404] p-1.5 text-white shadow-2xl border border-[#660606] ring-1 ring-black/20">
                    <ul className="flex flex-col text-sm font-bold">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            onNavigateToProfile?.()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-[#660606] transition-colors"
                        >
                          <User size={18} className="text-amber-400" />
                          <span>Perfil</span>
                        </button>
                      </li>

                      {isGerente && (
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              onNavigateToAdmin?.()
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-amber-300 hover:bg-[#660606] transition-colors"
                          >
                            <ShieldCheck size={18} className="text-amber-400" />
                            <span>Painel do Gerente</span>
                          </button>
                        </li>
                      )}

                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            onNavigateToOrders?.()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-[#660606] transition-colors"
                        >
                          <Package size={18} className="text-amber-400" />
                          <span>Minhas Compras</span>
                        </button>
                      </li>

                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            onNavigateToFavorites?.()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-[#660606] transition-colors"
                        >
                          <Heart size={18} className="text-amber-400" />
                          <span>Favoritos</span>
                        </button>
                      </li>

                      <li className="my-1 border-t border-white/10" />

                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            onLogout?.()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 transition-colors"
                        >
                          <LogOut size={18} className="text-rose-400" />
                          <span>Sair</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity focus:outline-none"
            >
              <User size={24} />
              <div className="text-xs">
                <span className="block font-bold">Acesse sua Conta</span>
                <span className="text-slate-300 text-[11px] flex items-center gap-0.5">
                  ou Cadastre-se <ChevronDown size={12} />
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Sub-navegação / Faixa Branca */}
      <div className="bg-white text-slate-800 text-xs border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex w-56 items-center justify-between rounded-sm bg-[#480404] px-4 py-2 font-bold text-white hover:bg-[#5c0505] transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Menu size={18} />
                  <span>Todas categorias</span>
                </div>
                {isCategoriesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isCategoriesOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsCategoriesOpen(false)}
                  />

                  <div className="absolute left-0 top-full z-50 w-56 bg-white shadow-xl border-x border-b border-slate-100 py-1">
                    <ul className="flex flex-col">
                      {categories.map((cat) => {
                        const IconComponent = cat.icon
                        return (
                          <li key={cat.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCategoriesOpen(false)
                                onNavigateToProducts?.(cat.name)
                              }}
                              className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-[#FFF9F0] hover:text-[#480404] transition-colors text-left"
                            >
                              <div className="flex items-center gap-3">
                                <IconComponent size={20} className="text-[#480404]" />
                                <span>{cat.name}</span>
                              </div>
                              <ChevronRight size={16} className="text-[#480404]" />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Links de navegação com todos os filtros ativados */}
            <nav className="flex items-center gap-6 font-bold text-[#480404] whitespace-nowrap text-sm">
              <button
                type="button"
                onClick={() => onNavigateToProducts?.()}
                className="hover:underline focus:outline-none"
              >
                Produtos
              </button>
              <button
                type="button"
                onClick={() => onNavigateToProducts?.('Limpeza')}
                className="hover:underline focus:outline-none"
              >
                Limpeza
              </button>
              <button
                type="button"
                onClick={() => onNavigateToProducts?.('Bebidas')}
                className="hover:underline focus:outline-none"
              >
                Bebidas
              </button>
              <button
                type="button"
                onClick={() => onNavigateToProducts?.('Ofertas da Semana')}
                className="hover:underline focus:outline-none"
              >
                Ofertas da Semana
              </button>
              <button
                type="button"
                onClick={() => onNavigateToProducts?.('Higiene e Beleza')}
                className="hover:underline focus:outline-none"
              >
                Higiene
              </button>
              <button
                type="button"
                onClick={() => onNavigateToProducts?.('Churrasco')}
                className="hover:underline focus:outline-none"
              >
                Churrasco
              </button>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-1.5 font-bold text-[#480404] text-xs">
            <MapPin size={16} className="text-[#480404]" />
            <span>Insira seu CEP</span>
          </div>
        </div>
      </div>
    </header>
  )
}