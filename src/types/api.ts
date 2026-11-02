// Formatos EXATOS devolvidos pela imma-api (snake_case, vindos do PostgreSQL).

export type ApiProduto = {
  id: string
  sku: string | null
  nome: string
  marca: string | null
  categoria: string | null
  preco_venda: number | string
  preco_original: number | string | null
  desconto_percentual: number | null
  estoque_fisico: number | null
  imagem_url: string | null
  criado_em?: string
}

export type ApiEndereco = {
  id: string
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  destinatario: string | null
  referencia: string | null
}

export type ApiUsuario = {
  id: string
  nome: string | null
  email: string
  telefone: string | null
  cpf: string | null
  role: 'cliente' | 'gerente'
  enderecos?: ApiEndereco[]
}

export type ApiPedidoItem = {
  id: string
  produto_id: string | null
  nome: string
  imagem_url: string | null
  preco_unitario: number | string
  quantidade: number
}

export type ApiPedido = {
  id: string
  codigo: string | null
  status: string
  forma_pagamento: string | null
  subtotal: number | string | null
  frete: number | string | null
  total: number | string
  prazo_faturamento: number | null
  data_pedido: string
  endereco: ApiEndereco | null
  itens: ApiPedidoItem[]
}
