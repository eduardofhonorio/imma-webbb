import { api } from './api'
import { toOrder } from './mappers'
import type { Order } from '../pages/OrdersPage'
import type { CartItem } from '../pages/CartPage'
import type { ApiPedido } from '../types/api'

export type FormaPagamento = Order['formaPagamento']

export const pedidosService = {
  async listarDoCliente(clienteId: string): Promise<Order[]> {
    return (await api<ApiPedido[]>(`/pedidos/cliente/${clienteId}`)).map(toOrder)
  },

  /**
   * Cria o pedido. Só enviamos QUAIS produtos e QUANTOS: preços, frete e total são
   * calculados pelo servidor. Dados de cartão NUNCA devem ser enviados aqui (use um gateway).
   */
  async criar(itens: CartItem[], formaPagamento: FormaPagamento, enderecoId?: string): Promise<Order> {
    const pedido = await api<ApiPedido>('/pedidos', {
      method: 'POST',
      body: {
        itens: itens.map((i) => ({ produto_id: i.id, quantidade: i.quantidade })),
        forma_pagamento: formaPagamento,
        endereco_id: enderecoId
      }
    })
    return toOrder(pedido)
  }
}
