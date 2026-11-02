import { User, Truck, ArrowLeft, Lock } from 'lucide-react'
import { useState } from 'react'
import { cepService } from '../services/cep'
import type { RegisterData } from '../services/auth'

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

type RegisterPageProps = {
  onBackToHome: () => void
  /** Cria a conta na API. Deve lançar um Error com a mensagem a exibir quando falhar. */
  onSubmitRegister: (data: RegisterData) => Promise<void>
}

export function RegisterPage({ onBackToHome, onSubmitRegister }: RegisterPageProps) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [cepStatus, setCepStatus] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nomeCompleto: '',
    cpf: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'MG',
    nomeDestinatario: '',
    referenciaEntrega: ''
  })

  // Funções de formatação de máscaras
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length === 0) return ''
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    let formattedValue = value
    if (name === 'cpf') {
      formattedValue = formatCPF(value)
    } else if (name === 'cep') {
      formattedValue = formatCEP(value)
    } else if (name === 'telefone') {
      formattedValue = formatPhone(value)
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))

    if (name === 'cep') {
      if (formattedValue.replace(/\D/g, '').length === 8) {
        void preencherPeloCep(formattedValue)
      } else {
        setCepStatus('')
      }
    }
  }

  // Preenche rua, bairro, cidade e UF a partir do CEP (via API -> ViaCEP). Se falhar, o usuário digita manualmente.
  const preencherPeloCep = async (cep: string) => {
    setCepStatus('Buscando endereço...')
    try {
      const r = await cepService.buscar(cep)
      setFormData((prev) => ({
        ...prev,
        endereco: r.logradouro || prev.endereco,
        bairro: r.bairro || prev.bairro,
        cidade: r.cidade || prev.cidade,
        estado: r.uf || prev.estado
      }))
      setCepStatus('')
    } catch (err) {
      setCepStatus(err instanceof Error ? err.message : 'Não foi possível buscar o CEP.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await onSubmitRegister({
        ...formData,
        email: formData.email.trim(),
        nomeDestinatario: formData.nomeDestinatario || formData.nomeCompleto
      })
    } catch (err) {
      setErro(err instanceof Error && err.message ? err.message : 'Não foi possível concluir o cadastro.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Botão de Voltar */}
      <button
        type="button"
        onClick={onBackToHome}
        className="mb-6 flex items-center gap-2 text-xs font-bold text-[#480404] hover:underline"
      >
        <ArrowLeft size={16} />
        Voltar 
      </button>

      {/* Título Principal */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-900">Cadastre-se</h2>
        <p className="mt-1 text-sm text-slate-600">Informe seus dados cadastrais para criar sua conta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* SEÇÃO 1: Dados Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <User size={22} className="text-[#480404]" />
              <div>
                <h3 className="text-base font-bold text-[#480404]">Dados Pessoais</h3>
                <p className="text-[11px] text-slate-500">
                  Informações necessárias para o seu acesso e identificação
                </p>
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-800 mb-1">
                E-mail*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="seuemail@dominio.com"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-xs font-bold text-slate-800 mb-1">
                Senha de Acesso*
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  required
                  minLength={6}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="Crie uma senha de acesso (mín. 6 caracteres)"
                  value={formData.senha}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                />
              </div>
            </div>

            {/* Nome Completo */}
            <div>
              <label htmlFor="nomeCompleto" className="block text-xs font-bold text-slate-800 mb-1">
                Nome Completo*
              </label>
              <input
                type="text"
                id="nomeCompleto"
                name="nomeCompleto"
                required
                value={formData.nomeCompleto}
                onChange={handleChange}
                placeholder="Seu nome completo"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
              />
            </div>

            {/* CPF e Telefone com Máscaras */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cpf" className="block text-xs font-bold text-slate-800 mb-1">
                  CPF*
                </label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  required
                  maxLength={14}
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404] font-mono"
                />
              </div>

              <div>
                <label htmlFor="telefone" className="block text-xs font-bold text-slate-800 mb-1">
                  Telefone*
                </label>
                <input
                  type="text"
                  id="telefone"
                  name="telefone"
                  required
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404] font-mono"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: Entrega */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Truck size={22} className="text-[#480404]" />
              <div>
                <h3 className="text-base font-bold text-[#480404]">Entrega</h3>
                <p className="text-[11px] text-slate-500">
                  Preencha seus dados para envio e cobrança
                </p>
              </div>
            </div>

            {/* CEP (com máscara), Endereço e Número */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <label htmlFor="cep" className="block text-xs font-bold text-slate-800 mb-1">
                  CEP*
                </label>
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  required
                  maxLength={9}
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404] font-mono"
                />
                {cepStatus && <p className="mt-1 text-[10px] font-semibold text-slate-500">{cepStatus}</p>}
              </div>

              <div className="col-span-5">
                <label htmlFor="endereco" className="block text-xs font-bold text-slate-800 mb-1">
                  Endereço*
                </label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  required
                  value={formData.endereco}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                />
              </div>

              <div className="col-span-3">
                <label htmlFor="numero" className="block text-xs font-bold text-slate-800 mb-1">
                  Número*
                </label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  required
                  value={formData.numero}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                />
              </div>
            </div>

            {/* Complemento e Bairro */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="complemento" className="block text-xs font-bold text-slate-800 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                />
              </div>

              <div>
                <label htmlFor="bairro" className="block text-xs font-bold text-slate-800 mb-1">
                  Bairro*
                </label>
                <input
                  type="text"
                  id="bairro"
                  name="bairro"
                  required
                  value={formData.bairro}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                />
              </div>
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-8">
                <label htmlFor="cidade" className="block text-xs font-bold text-slate-800 mb-1">
                  Cidade*
                </label>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  required
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                />
              </div>

              <div className="col-span-4">
                <label htmlFor="estado" className="block text-xs font-bold text-slate-800 mb-1">
                  Estado*
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                >
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Submissão Alinhado à Direita */}
        {erro && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
            {erro}
          </div>
        )}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-64 rounded-md bg-[#480404] py-3 text-sm font-bold text-white transition-colors hover:bg-[#660606] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  )
}