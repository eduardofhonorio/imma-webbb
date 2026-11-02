import { api } from './api'
import { toApiProduto, toProduct } from './mappers'
import type { Product } from '../components/ProductCard'
import type { ApiProduto } from '../types/api'

export const produtosService = {
  async listar(): Promise<Product[]> {
    return (await api<ApiProduto[]>('/produtos', { auth: false })).map(toProduct)
  },
  async maisVendidos(limite = 6): Promise<Product[]> {
    return (await api<ApiProduto[]>(`/produtos/mais-vendidos?limite=${limite}`, { auth: false })).map(toProduct)
  },
  async ofertas(limite = 6): Promise<Product[]> {
    return (await api<ApiProduto[]>(`/produtos/ofertas?limite=${limite}`, { auth: false })).map(toProduct)
  },
  async criar(dados: Partial<Product>): Promise<Product> {
    return toProduct(await api<ApiProduto>('/produtos', { method: 'POST', body: toApiProduto(dados) }))
  },
  async atualizar(id: string | number, dados: Partial<Product>): Promise<Product> {
    return toProduct(await api<ApiProduto>(`/produtos/${id}`, { method: 'PUT', body: toApiProduto(dados) }))
  },
  async remover(id: string | number): Promise<void> {
    await api<{ mensagem: string }>(`/produtos/${id}`, { method: 'DELETE' })
  }
}
