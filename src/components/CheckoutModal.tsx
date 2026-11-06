import { useState } from 'react'
import {
  X,
  ShoppingCart,
  MapPin,
  CreditCard,
  ShieldCheck,
  ClipboardList,
  Lock,
  CheckCircle2,
  QrCode,
  FileText,
  HelpCircle
} from 'lucide-react'
import type { CartItem } from '../pages/CartPage'
import type { Order } from '../pages/OrdersPage'
import type { Endereco } from '../services/auth'

type CheckoutModalProps = {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  /** Endereço de entrega do cliente (cadastrado no registro). */
  address?: Endereco | null
  /**
   * Cria o pedido na API e devolve o pedido confirmado (com total/frete calculados pelo servidor).
   * Lança Error com a mensagem a exibir se falhar (ex.: estoque insuficiente).
   */
  onConfirmOrder: (paymentMethod: 'pix' | 'credit' | 'boleto') => Promise<Order>
  /** Chamado ao fechar a tela de sucesso (ex.: navegar para "Minhas compras"). */
  onFinish: () => void
}

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  address,
  onConfirmOrder,
  onFinish
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'boleto'>('pix')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)

  // Estado do formulário de cartão de crédito
  const [cardData, setCardData] = useState({
    numero: '',
    validade: '',
    cvv: '',
    nomeTitular: '',
    parcelas: '1'
  })

  if (!isOpen) return null

  // Cálculos dinâmicos do checkout
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantidade, 0)
  const subtotal = items.reduce((acc, item) => acc + item.precoVenda * item.quantidade, 0)
  const frete = subtotal > 150 || subtotal === 0 ? 0 : 15.0
  const total = subtotal + frete

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCardData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFinishOrder = async () => {
    if (!address) {
      setErro('Cadastre um endereço de entrega no seu perfil antes de finalizar.')
      return
    }
    if (paymentMethod === 'credit') {
      if (!cardData.numero || !cardData.validade || !cardData.cvv || !cardData.nomeTitular) {
        setErro('Por favor, preencha todos os campos do cartão de crédito.')
        return
      }
    }

    setErro('')
    setLoading(true)
    try {
      // IMPORTANTE: os dados do cartão ficam só neste formulário e NÃO são enviados à API.
      // A cobrança deve ser feita por um gateway de pagamento (tokenização) - ver README.
      const pedido = await onConfirmOrder(paymentMethod)
      setCreatedOrder(pedido)
      setCardData({ numero: '', validade: '', cvv: '', nomeTitular: '', parcelas: '1' })
    } catch (e) {
      setErro(e instanceof Error && e.message ? e.message : 'Não foi possível finalizar o pedido.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSuccess = () => {
    setCreatedOrder(null)
    onFinish()
    onClose()
  }

  // Modal de Sucesso do Pedido
  if (createdOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center space-y-4">
          <div className="flex justify-center text-emerald-600">
            <CheckCircle2 size={64} className="animate-bounce" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Pedido realizado com sucesso!</h3>
          <p className="text-xs text-slate-600">
            Seu pedido foi registrado no sistema da IMMA Atacadista e já está sendo preparado para envio.
          </p>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 font-semibold space-y-1">
            <p>Pedido: <span className="font-bold text-[#480404]">{createdOrder.codigo}</span></p>
            <p>Forma de pagamento: <span className="uppercase text-[#480404] font-bold">{createdOrder.formaPagamento === 'credit' ? 'Cartão de Crédito' : createdOrder.formaPagamento === 'pix' ? 'PIX' : 'Boleto Bancário'}</span></p>
            <p>Valor total: <span className="font-bold text-[#480404]">R$ {createdOrder.total.toFixed(2).replace('.', ',')}</span></p>
          </div>
          <button
            type="button"
            onClick={handleCloseSuccess}
            className="w-full rounded-md bg-[#480404] py-3 text-sm font-bold text-white transition-colors hover:bg-[#660606]"
          >
            Ver Minhas Compras →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden my-6">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between bg-[#480404] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 p-2">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Finalizar sua compra</h2>
              <p className="text-xs text-slate-200">Confira os detalhes e escolha a forma de pagamento</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo em 2 Colunas */}
        <div className="grid gap-6 p-6 lg:grid-cols-12">
          {/* Coluna Esquerda */}
          <div className="lg:col-span-7 space-y-5">
            {/* Endereço */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900">
                <MapPin size={20} className="text-[#480404]" />
                <h3 className="text-base font-bold">Endereço de entrega</h3>
              </div>

              {address ? (
                <div className="rounded-xl border border-rose-200 bg-[#FFF5F5] p-3.5">
                  <span className="block text-sm font-bold text-slate-900">
                    {address.logradouro}, {address.numero}
                    {address.complemento ? ` - ${address.complemento}` : ''}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {[address.bairro, `${address.cidade} - ${address.uf}`, address.cep].filter(Boolean).join(' • ')}
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-semibold text-amber-800">
                  Nenhum endereço de entrega cadastrado. Cadastre um endereço para finalizar o pedido.
                </div>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900">
                <CreditCard size={20} className="text-[#480404]" />
                <h3 className="text-base font-bold">Forma de pagamento</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-[#480404] bg-rose-50/50 ring-1 ring-[#480404]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <QrCode size={18} className={paymentMethod === 'pix' ? 'text-[#480404]' : 'text-slate-400'} />
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'pix'
                          ? 'border-[#480404] bg-[#480404] text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'pix' && <CheckCircle2 size={12} />}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs font-bold text-slate-900">Pix</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">Pagamento instantâneo</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                    paymentMethod === 'credit'
                      ? 'border-[#480404] bg-rose-50/50 ring-1 ring-[#480404]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <CreditCard size={18} className={paymentMethod === 'credit' ? 'text-[#480404]' : 'text-slate-400'} />
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'credit'
                          ? 'border-[#480404] bg-[#480404] text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'credit' && <CheckCircle2 size={12} />}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs font-bold text-slate-900">Cartão de Crédito</span>
                    <span className="text-[10px] text-[#480404] font-bold block leading-tight">Em até 12x</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                    paymentMethod === 'boleto'
                      ? 'border-[#480404] bg-rose-50/50 ring-1 ring-[#480404]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <FileText size={18} className={paymentMethod === 'boleto' ? 'text-[#480404]' : 'text-slate-400'} />
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'boleto'
                          ? 'border-[#480404] bg-[#480404] text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'boleto' && <CheckCircle2 size={12} />}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="block text-xs font-bold text-slate-900">Boleto Bancário</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">Vencimento em até 3 dias</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Cartão de Crédito Form */}
            {paymentMethod === 'credit' && (
              <div className="rounded-xl border border-rose-200 bg-[#FFF5F5] p-4 space-y-3.5">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6">
                    <label htmlFor="numero" className="block text-[11px] font-bold text-slate-900 mb-1">
                      Número do cartão <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        id="numero"
                        name="numero"
                        value={cardData.numero}
                        onChange={handleInputChange}
                        placeholder="Digite o número do cartão"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                      />
                    </div>
                  </div>

                  <div className="col-span-3">
                    <label htmlFor="validade" className="block text-[11px] font-bold text-slate-900 mb-1">
                      Validade <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="validade"
                      name="validade"
                      value={cardData.validade}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                    />
                  </div>

                  <div className="col-span-3">
                    <label htmlFor="cvv" className="block text-[11px] font-bold text-slate-900 mb-1">
                      CVV <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleInputChange}
                        placeholder="CVV"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                      />
                      <HelpCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" size={14} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-7">
                    <label htmlFor="nomeTitular" className="block text-[11px] font-bold text-slate-900 mb-1">
                      Nome do titular <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="nomeTitular"
                      name="nomeTitular"
                      value={cardData.nomeTitular}
                      onChange={handleInputChange}
                      placeholder="Como está no cartão"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                    />
                  </div>

                  <div className="col-span-5">
                    <label htmlFor="parcelas" className="block text-[11px] font-bold text-slate-900 mb-1">
                      Parcelamento <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="parcelas"
                      name="parcelas"
                      value={cardData.parcelas}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                    >
                      <option value="1">1x (à vista) - R$ {total.toFixed(2).replace('.', ',')}</option>
                      <option value="2">2x de R$ {(total / 2).toFixed(2).replace('.', ',')} sem juros</option>
                      <option value="3">3x de R$ {(total / 3).toFixed(2).replace('.', ',')} sem juros</option>
                      <option value="6">6x de R$ {(total / 6).toFixed(2).replace('.', ',')} sem juros</option>
                      <option value="12">12x de R$ {(total / 12).toFixed(2).replace('.', ',')} sem juros</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Banner Segurança */}
            <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-[#FFF5F5] p-3.5 text-xs">
              <div className="rounded-full bg-[#480404] p-1.5 text-white shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="block font-bold text-[#480404]">Compra segura</span>
                <span className="text-slate-600 text-[11px]">Seus dados estão protegidos e sua compra é 100% segura.</span>
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 rounded-lg bg-[#480404] px-4 py-2.5 text-white mb-3">
                <ClipboardList size={18} />
                <h3 className="text-sm font-bold">Resumo do pedido</h3>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 text-xs border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {item.imagemUrl && (
                        <img src={item.imagemUrl} alt={item.nome} className="h-9 w-9 object-contain rounded" />
                      )}
                      <div className="truncate">
                        <span className="block font-semibold text-slate-800 truncate">{item.nome}</span>
                        <span className="text-[10px] text-slate-400">Qtd: {item.quantidade}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      R$ {(item.precoVenda * item.quantidade).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 border-t border-slate-200 pt-3 text-xs mt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({totalItemsCount} itens)</span>
                  <span className="font-semibold text-slate-800">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frete (prévia)</span>
                  <span className="font-semibold text-slate-800">
                    {frete === 0 ? 'R$ 0,00' : `R$ ${frete.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-900">
                  <span>Total</span>
                  <span className="text-[#480404]">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>

            {erro && (
              <div role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                {erro}
              </div>
            )}
            <button
              type="button"
              onClick={handleFinishOrder}
              disabled={loading || items.length === 0 || !address}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#480404] py-3 text-sm font-bold text-white transition-colors hover:bg-[#660606] active:scale-[0.99] disabled:opacity-50"
            >
              <Lock size={16} />
              {loading ? 'Processando...' : 'Finalizar pedido →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}