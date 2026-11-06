import { useState } from 'react'
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBag,
  ArrowLeft,
  Calendar,
  CreditCard,
  QrCode,
  FileText,
  RotateCcw,
  Search,
  AlertCircle
} from 'lucide-react'

export type OrderItem = {
  id: string
  nome: string
  quantidade: number
  precoVenda: number
  imagemUrl?: string
}

export type Order = {
  id: string
  codigo: string
  data: string
  status: 'preparando' | 'em_transito' | 'entregue' | 'cancelado'
  formaPagamento: 'pix' | 'credit' | 'boleto'
  total: number
  subtotal?: number
  frete?: number
  itens: OrderItem[]
  enderecoEntrega?: string
}

type OrdersPageProps = {
  orders: Order[]
  onBackToHome: () => void
  onNavigateToProducts: () => void
  onReorder?: (items: OrderItem[]) => void
}

export function OrdersPage({
  orders,
  onBackToHome,
  onNavigateToProducts,
  onReorder
}: OrdersPageProps) {
  const [activeTab, setActiveTab] = useState<'todos' | 'em_andamento' | 'entregues' | 'cancelados'>('todos')
  const [searchQuery, setSearchQuery] = useState('')

  // Filtragem dinâmica de pedidos por busca e abas
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      order.codigo.toLowerCase().includes(query) ||
      order.itens.some((item) => item.nome.toLowerCase().includes(query))

    if (!matchesSearch) return false

    if (activeTab === 'em_andamento') {
      return order.status === 'preparando' || order.status === 'em_transito'
    }
    if (activeTab === 'entregues') {
      return order.status === 'entregue'
    }
    if (activeTab === 'cancelados') {
      return order.status === 'cancelado'
    }

    return true
  })

  // Contadores dinâmicos para as abas
  const countEmAndamento = orders.filter(
    (o) => o.status === 'preparando' || o.status === 'em_transito'
  ).length
  const countEntregues = orders.filter((o) => o.status === 'entregue').length
  const countCancelados = orders.filter((o) => o.status === 'cancelado').length

  // Badges de Status
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'preparando':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock size={14} /> Separando pedido
          </span>
        )
      case 'em_transito':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <Truck size={14} /> A caminho
          </span>
        )
      case 'entregue':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={14} /> Entregue
          </span>
        )
      case 'cancelado':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
            <AlertCircle size={14} /> Cancelado
          </span>
        )
    }
  }

  // Ícone de Pagamento
  const getPaymentIcon = (method: Order['formaPagamento']) => {
    switch (method) {
      case 'pix':
        return <QrCode size={14} className="text-[#480404]" />
      case 'credit':
        return <CreditCard size={14} className="text-[#480404]" />
      case 'boleto':
        return <FileText size={14} className="text-[#480404]" />
    }
  }

  return (
    <main className="min-h-[85vh] bg-slate-50/60 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Botão de Voltar */}
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-bold text-[#480404] hover:underline focus:outline-none"
        >
          <ArrowLeft size={16} />
          Voltar para a página inicial
        </button>

        {/* Título Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#480404] text-white shadow-md">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Minhas Compras</h1>
              <p className="text-xs font-semibold text-slate-500">
                Acompanhe o status e o histórico dos seus pedidos
              </p>
            </div>
          </div>

          {/* Campo de Busca de Pedidos Funcional */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código (#IMMA...) ou produto..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          </div>
        </div>

        {/* Abas de Filtro de Status Dinâmicas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('todos')}
            className={`rounded-lg px-4 py-2 transition-all whitespace-nowrap ${
              activeTab === 'todos'
                ? 'bg-[#480404] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todos os pedidos ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('em_andamento')}
            className={`rounded-lg px-4 py-2 transition-all whitespace-nowrap ${
              activeTab === 'em_andamento'
                ? 'bg-[#480404] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Em andamento ({countEmAndamento})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('entregues')}
            className={`rounded-lg px-4 py-2 transition-all whitespace-nowrap ${
              activeTab === 'entregues'
                ? 'bg-[#480404] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Entregues ({countEntregues})
          </button>
          {countCancelados > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('cancelados')}
              className={`rounded-lg px-4 py-2 transition-all whitespace-nowrap ${
                activeTab === 'cancelados'
                  ? 'bg-[#480404] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Cancelados ({countCancelados})
            </button>
          )}
        </div>

        {/* LISTAGEM DE PEDIDOS */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 space-y-4"
              >
                {/* Cabeçalho do Card de Pedido */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-[#480404]">{order.codigo}</span>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                      <Calendar size={13} />
                      <span>{order.data}</span>
                    </div>
                  </div>

                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Itens do Pedido */}
                <div className="space-y-3">
                  {order.itens.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {item.imagemUrl ? (
                          <img
                            src={item.imagemUrl}
                            alt={item.nome}
                            className="h-12 w-12 object-contain rounded-lg border border-slate-100 p-1 bg-slate-50 shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-rose-50 flex items-center justify-center text-[#480404] shrink-0">
                            <ShoppingBag size={18} />
                          </div>
                        )}
                        <div className="truncate">
                          <span className="block font-bold text-slate-800 truncate">{item.nome}</span>
                          <span className="text-slate-400 text-[11px]">
                            {item.quantidade}x R$ {item.precoVenda.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      <span className="font-bold text-slate-900 shrink-0">
                        R$ {(item.quantidade * item.precoVenda).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rodapé do Card: Pagamento, Total e Botão "Comprar novamente" */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                      {getPaymentIcon(order.formaPagamento)}
                      <span className="capitalize">{order.formaPagamento === 'credit' ? 'Cartão de Crédito' : order.formaPagamento === 'pix' ? 'PIX' : 'Boleto Bancário'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total do Pedido</span>
                      <span className="text-base font-black text-[#480404]">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <button
                    type="button"
                    onClick={() => onReorder?.(order.itens)}
                    className="flex items-center gap-1.5 rounded-xl border border-[#480404] py-2 px-4 text-xs font-bold text-[#480404] transition-colors hover:bg-rose-50"
                  >
                    <RotateCcw size={14} />
                    Comprar novamente
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Estado Vazio */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-[#480404] mb-4">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Nenhum pedido encontrado</h3>
            <p className="mt-1 max-w-sm text-xs font-semibold text-slate-500">
              {searchQuery
                ? `Nenhum pedido atende ao termo "${searchQuery}".`
                : 'Você ainda não realizou compras. Aproveite para conferir as melhores ofertas do nosso atacado!'}
            </p>
            <button
              type="button"
              onClick={onNavigateToProducts}
              className="mt-5 rounded-xl bg-[#480404] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#660606] shadow-sm"
            >
              Explorar Produtos
            </button>
          </div>
        )}
      </div>
    </main>
  )
}