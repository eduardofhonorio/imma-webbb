import { api, tokenStorage } from './api'
import { toUser } from './mappers'
import type { ApiUsuario } from '../types/api'

export type Endereco = {
  id: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  destinatario: string
  referencia: string
}

export type AuthUser = {
  id: string
  email: string
  nome?: string
  telefone?: string
  cpf?: string
  role: 'cliente' | 'gerente'
  enderecos: Endereco[]
}

export type RegisterData = {
  email: string
  senha: string
  nomeCompleto: string
  cpf: string
  telefone: string
  cep: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  nomeDestinatario: string
  referenciaEntrega: string
}

type SessaoResposta = { token: string; usuario: ApiUsuario }

export const authService = {
  async login(email: string, senha: string): Promise<AuthUser> {
    const r = await api<SessaoResposta>('/auth/login', { method: 'POST', body: { email, senha }, auth: false })
    tokenStorage.set(r.token)
    return toUser(r.usuario)
  },

  async registrar(dados: RegisterData): Promise<AuthUser> {
    const r = await api<SessaoResposta>('/auth/register', { method: 'POST', body: dados, auth: false })
    tokenStorage.set(r.token)
    return toUser(r.usuario)
  },

  /** Restaura a sessão a partir do token salvo. Retorna null se não houver sessão válida. */
  async restaurarSessao(): Promise<AuthUser | null> {
    if (!tokenStorage.get()) return null
    try {
      const r = await api<{ usuario: ApiUsuario }>('/auth/me')
      return toUser(r.usuario)
    } catch {
      tokenStorage.clear()
      return null
    }
  },

  logout() {
    tokenStorage.clear()
  },

  async atualizarPerfil(dados: { nome?: string; telefone?: string }): Promise<AuthUser> {
    const r = await api<{ usuario: ApiUsuario }>('/auth/me', { method: 'PUT', body: dados })
    return toUser(r.usuario)
  },

  async alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
    await api('/auth/senha', { method: 'PUT', body: { senha_atual: senhaAtual, nova_senha: novaSenha } })
  }
}
