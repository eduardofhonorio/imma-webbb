import { X } from 'lucide-react'

type RegisterNoticeModalProps = {
  isOpen: boolean
  onClose: () => void
  onGoToAuth: () => void
}

export function RegisterNoticeModal({
  isOpen,
  onClose,
  onGoToAuth
}: RegisterNoticeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      {/* Caixa do Pop-up (Estilo Bege #FFF9F0) */}
      <div className="relative w-full max-w-md rounded-lg bg-[#FFF9F0] p-8 text-center shadow-2xl transition-all">
        {/* Botão Fechar (X) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-800 focus:outline-none"
        >
          <X size={20} />
        </button>

        {/* Título Principal */}
        <h3 className="mb-4 text-2xl font-black text-[#480404]">
          Cadastro obrigatório
        </h3>

        {/* Mensagem Explicativa */}
        <p className="mb-6 text-sm leading-relaxed text-slate-700">
          Para continuar navegando e não perder nenhum detalhe, crie sua conta
          gratuita agora mesmo. Garanta seu acesso completo à nossa plataforma
        </p>

        {/* Botão Entrar / Cadastrar */}
        <button
          type="button"
          onClick={() => {
            onClose()
            onGoToAuth()
          }}
          className="w-full rounded-md bg-[#800000] py-3.5 text-base font-bold text-white transition-colors hover:bg-[#5c0505] active:scale-[0.99]"
        >
          Entrar
        </button>
      </div>
    </div>
  )
}