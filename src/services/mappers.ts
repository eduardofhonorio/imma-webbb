// Converte os JSONs da API (snake_case, NUMERIC possivelmente como string)
// nas estruturas que os componentes React usam (camelCase, number).
import type { Product } from '../components/ProductCard'
import type { Order, OrderItem } from '../components/OrdersPage'
import type { AuthUser, Endereco } from './auth'
import type { ApiEndereco, ApiPedido, ApiPedidoItem, ApiProduto, ApiUsuario } from '../types/api'

const num = (v: number | string | null | undefined): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const numOpc = (v: number | string | null | undefined): number | undefined =>
  v === null || v === undefined || v === '' ? undefined : num(v)

export function toProduct(p: ApiProduto): Product {
  return {
    id: p.id,
    sku: p.sku ?? undefined,
    nome: p.nome,
    marca: p.marca ?? undefined,
    categoria: p.categoria ?? undefined,
    precoVenda: num(p.preco_venda),
    precoOriginal: numOpc(p.preco_original),
    descontoPercentual: p.desconto_percentual ?? undefined,
    estoqueFisico: p.estoque_fisico ?? 0,
    imagemUrl: p.imagem_url ?? undefined
  }
}

/** Formulário/componentes (camelCase) -> corpo esperado pela API (snake_case). */
export function toApiProduto(p: Partial<Product>) {
  const body: Record<string, unknown> = {}
  if (p.sku !== undefined) body.sku = p.sku
  if (p.nome !== undefined) body.nome = p.nome
  if (p.marca !== undefined) body.marca = p.marca
  if (p.categoria !== undefined) body.categoria = p.categoria
  if (p.precoVenda !== undefined) body.preco_venda = p.precoVenda
  // null explícito limpa o campo no banco; undefined => não altera
  if ('precoOriginal' in p) body.preco_original = p.precoOriginal ?? null
  if ('descontoPercentual' in p) body.desconto_percentual = p.descontoPercentual ?? 0
  if (p.estoqueFisico !== undefined) body.estoque_fisico = p.estoqueFisico
  if ('imagemUrl' in p) body.imagem_url = p.imagemUrl || null
  return body
}

export function toEndereco(e: ApiEndereco): Endereco {
  return {
    id: e.id,
    cep: e.cep ?? '',
    logradouro: e.logradouro ?? '',
    numero: e.numero ?? '',
    complemento: e.complemento ?? '',
    bairro: e.bairro ?? '',
    cidade: e.cidade ?? '',
    uf: (e.uf ?? '').trim(),
    destinatario: e.destinatario ?? '',
    referencia: e.referencia ?? ''
  }
}

export function toUser(u: ApiUsuario): AuthUser {
  return {
    id: u.id,
    email: u.email,
    nome: u.nome ?? undefined,
    telefone: u.telefone ?? undefined,
    cpf: u.cpf ?? undefined,
    role: u.role === 'gerente' ? 'gerente' : 'cliente',
    enderecos: (u.enderecos ?? []).map(toEndereco)
  }
}

const STATUS_VALIDOS: Order['status'][] = ['preparando', 'em_transito', 'entregue', 'cancelado']
const FORMAS: Order['formaPagamento'][] = ['pix', 'credit', 'boleto']

export const formatarEnderecoCurto = (e: Pick<Endereco, 'logradouro' | 'numero' | 'cidade' | 'uf'>): string => {
  const rua = [e.logradouro, e.numero].filter(Boolean).join(', ')
  const cidade = [e.cidade, e.uf].filter(Boolean).join(' - ')
  return [rua, cidade].filter(Boolean).join(' • ')
}

function toOrderItem(i: ApiPedidoItem): OrderItem {
  return {
    id: i.produto_id ?? i.id, // id do PRODUTO: usado em "Comprar novamente"
    nome: i.nome,
    quantidade: i.quantidade,
    precoVenda: num(i.preco_unitario),
    imagemUrl: i.imagem_url ?? undefined
  }
}

export function toOrder(p: ApiPedido): Order {
  const quando = new Date(p.data_pedido)
  const data = Number.isNaN(quando.getTime())
    ? ''
    : `${quando.toLocaleDateString('pt-BR')} às ${quando.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

  const status = STATUS_VALIDOS.includes(p.status as Order['status']) ? (p.status as Order['status']) : 'preparando'
  const forma = FORMAS.includes(p.forma_pagamento as Order['formaPagamento'])
    ? (p.forma_pagamento as Order['formaPagamento'])
    : 'pix'

  return {
    id: p.id,
    codigo: `#${p.codigo ?? p.id.slice(0, 8).toUpperCase()}`,
    data,
    status,
    formaPagamento: forma,
    total: num(p.total),
    subtotal: numOpc(p.subtotal),
    frete: numOpc(p.frete),
    itens: p.itens.map(toOrderItem),
    enderecoEntrega: p.endereco ? formatarEnderecoCurto(toEndereco(p.endereco)) : undefined
  }
}
