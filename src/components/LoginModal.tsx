import { useState } from 'react'
import { X, Mail, Lock, LogIn } from 'lucide-react'

type LoginModalProps = {
  isOpen: boolean
  onClose: () => void
  /** Autentica na API. Deve lançar um Error com a mensagem a exibir quando falhar. */
  onLogin: (email: string, senha: string) => Promise<void>
  onOpenRegister: () => void
}

export function LoginModal({ isOpen, onClose, onLogin, onOpenRegister }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.')
      return
    }

    setLoading(true)
    setErro('')

    try {
      await onLogin(email.trim(), senha)
      setEmail('')
      setSenha('')
    } catch (err) {
      setErro(err instanceof Error && err.message ? err.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Título e Subtítulo */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-black text-[#480404]">Acesse sua Conta</h2>
          <p className="mt-1 text-xs text-slate-500">
            Digite seu e-mail e senha para acessar a plataforma
          </p>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {erro}
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                id="login-email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@dominio.com"
                className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-senha" className="block text-xs font-bold text-slate-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                id="login-senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
              />
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#480404] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#660606] active:scale-[0.99] disabled:opacity-50"
          >
            <LogIn size={18} />
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        {/* Redirecionamento para Cadastro */}
        <div className="mt-6 text-center text-xs text-slate-600">
          Ainda não tem uma conta?{' '}
          <button
            type="button"
            onClick={onOpenRegister}
            className="font-bold text-[#480404] hover:underline focus:outline-none"
          >
            Cadastre-se aqui
          </button>
        </div>
      </div>
    </div>
  )
}