// Cliente HTTP único da aplicação. Todas as chamadas à imma-api passam por aqui.

// Em desenvolvimento aponta para a API local; em produção use VITE_API_URL
// (ex.: https://api.seudominio.com.br/api) ou publique a API sob o mesmo domínio em /api.
export const API_URL: string = (
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api')
).replace(/\/$/, '')

const TOKEN_KEY = 'imma_token'

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* armazenamento indisponível (modo privado): a sessão dura só até recarregar */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let onUnauthorized: (() => void) | null = null
/** O App registra aqui o que fazer quando o token expira (ex.: deslogar). */
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Quando false, um 401 não dispara o logout automático (ex.: tela de login). */
  auth?: boolean
  signal?: AbortSignal
}

export async function api<T>(path: string, { method = 'GET', body, auth = true, signal }: RequestOptions = {}): Promise<T> {
  const token = tokenStorage.get()

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.', 0)
  }

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    /* resposta sem corpo JSON */
  }

  if (!res.ok) {
    const erro = (data as { erro?: unknown } | null)?.erro
    const msg = typeof erro === 'string' && erro ? erro : `Erro inesperado (${res.status}).`
    if (res.status === 401 && auth && token) {
      tokenStorage.clear()
      onUnauthorized?.()
    }
    throw new ApiError(msg, res.status)
  }

  return data as T
}

export const mensagemDeErro = (e: unknown, padrao = 'Ocorreu um erro inesperado.'): string =>
  e instanceof Error && e.message ? e.message : padrao
