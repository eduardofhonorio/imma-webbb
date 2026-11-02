import { api } from './api'

export type CepResultado = { cep: string; logradouro: string; bairro: string; cidade: string; uf: string }

export const cepService = {
  buscar(cep: string): Promise<CepResultado> {
    return api<CepResultado>(`/cep/${cep.replace(/\D/g, '')}`, { auth: false })
  }
}
