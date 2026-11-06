import { Trash2, X, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react'

export type CartItem = {
  id: string
  nome: string
  marca: string
  precoOriginal?: number
  precoVenda: number
  quantidade: number
  descontoPercentual?: number
  imagemUrl?: string
  /** Estoque conhecido no momento da adição (limita a quantidade no carrinho). */
  estoqueFisico?: number
}

type CartPageProps = {
  items: CartItem[]
  onUpdateQuantity: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  onContinueShopping: () => void
  onCheckout: () => void
}

export function CartPage({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onContinueShopping,
  onCheckout
}: CartPageProps) {
  // Cálculos dinâmicos do resumo
  const totalItensCount = items.reduce((acc, item) => acc + item.quantidade, 0)
  const subtotal = items.reduce((acc, item) => acc + item.precoVenda * item.quantidade, 0)
  const frete = subtotal > 0 ? (subtotal > 150 ? 0 : 15.0) : 0
  const valorTotal = subtotal + frete

  // Estado para carrinho vazio
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <div className="flex justify-center text-[#480404]">
          <ShoppingBag size={64} className="opacity-40" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Seu carrinho está vazio</h2>
        <p className="text-sm text-slate-500">
          Você ainda não adicionou nenhum produto ao seu carrinho de compras.
        </p>
        <button
          type="button"
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 rounded-md bg-[#480404] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#660606]"
        >
          <ArrowLeft size={16} />
          Continuar comprando
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Título e Ação Principal */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Produtos no carrinho</h2>
          <p className="mt-0.5 text-sm font-bold text-[#480404]">
            {totalItensCount} {totalItensCount === 1 ? 'produto no carrinho' : 'produtos no carrinho'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClearCart}
          className="flex items-center gap-1.5 text-xs font-bold text-[#480404] hover:underline hover:text-rose-700 transition-colors"
        >
          <Trash2 size={16} />
          Limpar carrinho
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Selo de Desconto (canto superior esquerdo) */}
                {item.descontoPercentual && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#480404] px-2 py-0.5 text-[10px] font-bold text-white">
                    -{item.descontoPercentual}%
                  </span>
                )}

                {/* Botão Remover (canto superior direito) */}
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  title="Remover produto"
                  className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X size={16} />
                </button>

                {/* Imagem do Produto */}
                <div className="mt-4 flex h-32 items-center justify-center p-2">
                  <img
                    src={item.imagemUrl || '[suspicious link removed]'}
                    alt={item.nome}
                    className="max-h-full object-contain"
                  />
                </div>

                {/* Informações do Produto */}
                <div className="mt-3 space-y-1 text-center">
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{item.nome}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{item.marca}</p>

                  <div className="pt-1">
                    {item.precoOriginal && (
                      <span className="block text-[11px] text-slate-400 line-through">
                        R$ {item.precoOriginal.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    <div className="text-sm font-black text-[#480404]">
                      R$ {item.precoVenda.toFixed(2).replace('.', ',')}
                      <span className="text-[10px] font-normal text-slate-500"> /unidade</span>
                    </div>
                  </div>
                </div>

                {/* Seletor de Quantidade [- 5 +] */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center rounded-md bg-[#480404] text-white p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="px-2 py-1 text-white hover:bg-[#660606] rounded-l transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 text-xs font-bold text-white min-w-[28px] text-center">
                      {item.quantidade}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="px-2 py-1 text-white hover:bg-[#660606] rounded-r transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Voltar para a Loja */}
          <div className="pt-4">
            <button
              type="button"
              onClick={onContinueShopping}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#480404] hover:underline"
            >
              <ArrowLeft size={16} />
              Continuar comprando
            </button>
          </div>
        </div>

        {/* Coluna da Direita: Resumo do Pedido (4 cols) */}
        <div className="lg:col-span-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Resumo do pedido
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({totalItensCount} itens)</span>
              <span className="font-bold text-slate-800">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Frete</span>
              <span className="font-bold text-slate-800">
                {frete === 0 ? (
                  <span className="text-emerald-600 uppercase font-black text-[11px]">Grátis</span>
                ) : (
                  `R$ ${frete.toFixed(2).replace('.', ',')}`
                )}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Total</span>
            <span className="text-xl font-black text-[#480404]">
              R$ {valorTotal.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            type="button"
            onClick={onCheckout}
            className="w-full rounded-md bg-[#480404] py-3 text-sm font-bold text-white transition-colors hover:bg-[#660606] active:scale-[0.99] shadow"
          >
            Finalizar compra
          </button>
        </div>
      </div>
    </div>
  )
}