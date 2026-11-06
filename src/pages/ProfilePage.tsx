import { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  Pencil,
  Lock,
  LogOut,
  ChevronRight,
  Contact,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

type UserProfile = {
  email: string
  nome?: string
  telefone?: string
}

type ProfilePageProps = {
  user: UserProfile | null
  onLogout: () => void
  /** Salva nome/telefone na API. Lança Error com a mensagem a exibir se falhar. */
  onUpdateUser: (updatedData: { nome?: string; telefone?: string }) => Promise<void>
  /** Troca a senha na API. Lança Error com a mensagem a exibir se falhar. */
  onChangePassword: (senhaAtual: string, novaSenha: string) => Promise<void>
}

export function ProfilePage({ user, onLogout, onUpdateUser, onChangePassword }: ProfilePageProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  // Função para aplicar a máscara dinâmica de telefone (XX) XXXXX-XXXX
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length === 0) return ''
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  // Estados dos formulários
  const [nomeInput, setNomeInput] = useState(user?.nome || '')
  const [telefoneInput, setTelefoneInput] = useState(user?.telefone || '')
  const [salvando, setSalvando] = useState(false)
  const [perfilErro, setPerfilErro] = useState('')
  
  // Estados de alteração de senha
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [senhaErro, setSenhaErro] = useState('')

  const [feedbackMsg, setFeedbackMsg] = useState('')

  const nomeExibicao = user?.nome || (user?.email ? user.email.split('@')[0] : 'Usuário')
  const emailExibicao = user?.email || 'usuario@email.com'
  const telefoneExibicao = user?.telefone || 'Não informado'

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefoneInput(formatPhone(e.target.value))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setPerfilErro('')
    setSalvando(true)
    try {
      await onUpdateUser({ nome: nomeInput.trim(), telefone: telefoneInput.trim() })
    } catch (err) {
      setPerfilErro(err instanceof Error && err.message ? err.message : 'Não foi possível salvar o perfil.')
      setSalvando(false)
      return
    }
    setSalvando(false)
    setIsEditModalOpen(false)
    setFeedbackMsg('Perfil atualizado com sucesso!')
    setTimeout(() => setFeedbackMsg(''), 3000)
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSenhaErro('')

    // Validação de correspondência entre nova senha e confirmação
    if (novaSenha !== confirmarSenha) {
      setSenhaErro('A nova senha e a confirmação não conferem.')
      return
    }
    if (novaSenha.length < 6) {
      setSenhaErro('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    // A senha atual é validada pela API
    setSalvando(true)
    try {
      await onChangePassword(senhaAtual, novaSenha)
    } catch (err) {
      setSenhaErro(err instanceof Error && err.message ? err.message : 'Não foi possível alterar a senha.')
      setSalvando(false)
      return
    }
    setSalvando(false)

    // Sucesso ao alterar a senha
    setIsPasswordModalOpen(false)
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmarSenha('')
    setSenhaErro('')
    setFeedbackMsg('Senha alterada com sucesso!')
    setTimeout(() => setFeedbackMsg(''), 3000)
  }

  return (
    <main className="min-h-[85vh] bg-slate-50/60 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-5">
        
        {/* Mensagem de Feedback de Sucesso */}
        {feedbackMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-700 shadow-sm">
            <CheckCircle2 size={18} />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* CARD PRINCIPAL DO PERFIL */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          
          {/* Cabeçalho do Card */}
          <div className="mb-6 border-b border-[#480404]/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#480404] text-white shadow-md">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Meu Perfil</h2>
                <p className="text-xs font-semibold text-slate-500">Veja e edite suas informações</p>
              </div>
            </div>
          </div>

          {/* Corpo em 2 Colunas */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Coluna Esquerda: Avatar e Nome (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center md:border-r md:border-slate-100 md:pr-6">
              <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-rose-100/70 text-[#480404] shadow-inner ring-8 ring-rose-50/50">
                <User size={64} className="stroke-[1.75]" />
              </div>

              <h3 className="text-xl font-black text-slate-900 capitalize">{nomeExibicao}</h3>
              <p className="text-xs font-medium text-slate-500 mb-6">{emailExibicao}</p>

              <button
                type="button"
                onClick={() => {
                  setNomeInput(nomeExibicao)
                  setTelefoneInput(formatPhone(telefoneExibicao))
                  setIsEditModalOpen(true)
                }}
                className="flex w-full max-w-[220px] items-center justify-center gap-2 rounded-xl border-2 border-[#480404] py-2.5 px-4 text-xs font-bold text-[#480404] transition-all hover:bg-[#480404] hover:text-white active:scale-[0.99] shadow-sm"
              >
                <Pencil size={15} />
                <span>Editar Perfil</span>
              </button>
            </div>

            {/* Coluna Direita: Informações da Conta (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 mb-2">
                <Contact size={20} className="text-[#480404]" />
                <h4 className="text-base font-bold">Informações da Conta</h4>
              </div>

              <div className="space-y-3.5">
                {/* Campo E-mail */}
                <div className="flex items-center gap-3.5 border-b border-slate-100 pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#480404] shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400">E-mail</span>
                    <span className="text-xs font-bold text-slate-800">{emailExibicao}</span>
                  </div>
                </div>

                {/* Campo Nome */}
                <div className="flex items-center gap-3.5 border-b border-slate-100 pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#480404] shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400">Nome</span>
                    <span className="text-xs font-bold text-slate-800 capitalize">{nomeExibicao}</span>
                  </div>
                </div>

                {/* Campo Telefone */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#480404] shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400">Telefone</span>
                    <span className="text-xs font-bold text-slate-800">{telefoneExibicao}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: ALTERAR SENHA */}
        <button
          type="button"
          onClick={() => {
            setSenhaErro('')
            setSenhaAtual('')
            setNovaSenha('')
            setConfirmarSenha('')
            setIsPasswordModalOpen(true)
          }}
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-[#480404] hover:shadow-md focus:outline-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#480404]">
              <Lock size={18} />
            </div>
            <span className="text-sm font-bold text-slate-900">Alterar Senha</span>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        {/* CARD 3: SAIR DA CONTA */}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-rose-300 hover:shadow-md focus:outline-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <LogOut size={18} />
            </div>
            <span className="text-sm font-bold text-slate-900">Sair da Conta</span>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>

      {/* MODAL DE EDITAR PERFIL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-black text-[#480404] mb-4">Editar Perfil</h3>

            {perfilErro && (
              <div role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-600">
                {perfilErro}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Nome completo</label>
                <input
                  type="text"
                  required
                  value={nomeInput}
                  onChange={(e) => setNomeInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:border-[#480404] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={telefoneInput}
                  onChange={handlePhoneInputChange}
                  placeholder="(11) 98765-4321"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:border-[#480404] focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/2 rounded-lg border border-slate-300 py-2.5 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="w-1/2 rounded-lg bg-[#480404] py-2.5 font-bold text-white hover:bg-[#660606] disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ALTERAR SENHA COM VALIDAÇÃO DA SENHA ATUAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-black text-[#480404] mb-4">Alterar Senha</h3>

            {/* Mensagem de Erro de Validação de Senha */}
            {senhaErro && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
                <AlertCircle size={16} className="shrink-0" />
                <span>{senhaErro}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Senha Atual *</label>
                <input
                  type="password"
                  required
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:border-[#480404] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Nova Senha *</label>
                <input
                  type="password"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="No mínimo 6 caracteres"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:border-[#480404] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Confirmar Nova Senha *</label>
                <input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:border-[#480404] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="w-1/2 rounded-lg border border-slate-300 py-2.5 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="w-1/2 rounded-lg bg-[#480404] py-2.5 font-bold text-white hover:bg-[#660606] disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
