import { Heart, ShoppingCart, Pencil } from 'lucide-react'

export type Product = {
  id: string | number
  sku?: string
  /** Estoque físico vindo da API. undefined = desconhecido (não bloqueia a compra). */
  estoqueFisico?: number
  nome?: string
  name?: string
  marca?: string
  brand?: string
  precoOriginal?: number
  originalPrice?: number
  precoVenda?: number
  price?: number
  descontoPercentual?: number
  discountPercentage?: number
  imagemUrl?: string
  image?: string
  imageUrl?: string
  categoria?: string
  category?: string
}

type ProductCardProps = {
  product: Product
  isFavorite?: boolean
  isGerente?: boolean
  onAddToCart: () => void
  onToggleFavorite?: () => void
  onEdit?: () => void
}

export function ProductCard({
  product,
  isFavorite = false,
  isGerente = false,
  onAddToCart,
  onToggleFavorite,
  onEdit
}: ProductCardProps) {
  const nomeExibicao = product.nome || product.name || 'Produto'
  const precoExibicao = product.precoVenda ?? product.price ?? 0
  const precoOriginalExibicao = product.precoOriginal ?? product.originalPrice
  const marcaExibicao = product.marca || product.brand
  const descontoExibicao = product.descontoPercentual ?? product.discountPercentage
  const imagemExibicao = product.imagemUrl || product.image || product.imageUrl
  const esgotado = product.estoqueFisico !== undefined && product.estoqueFisico <= 0

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      {/* Botão de Coração (Favoritar) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite?.()
        }}
        title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 focus:outline-none"
      >
        <Heart
          size={16}
          className={
            isFavorite
              ? 'fill-rose-600 text-rose-600 transition-colors'
              : 'text-slate-400 hover:text-rose-500 transition-colors'
          }
        />
      </button>

      {/* Tag de Desconto */}
      {descontoExibicao && descontoExibicao > 0 && (
        <span className="absolute left-2 top-2 z-10 rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
          -{descontoExibicao}%
        </span>
      )}

      {/* Imagem do Produto */}
      <div className="flex h-32 w-full items-center justify-center overflow-hidden p-2">
        {imagemExibicao ? (
          <img
            src={imagemExibicao}
            alt={nomeExibicao}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold">
            Sem foto
          </div>
        )}
      </div>

      {/* Detalhes do Produto */}
      <div className="mt-2 space-y-1">
        {marcaExibicao && (
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {marcaExibicao}
          </span>
        )}

        <h4 className="line-clamp-2 text-xs font-bold text-slate-800 leading-tight">
          {nomeExibicao}
        </h4>

        {/* Preços */}
        <div className="pt-1">
          {precoOriginalExibicao && precoOriginalExibicao > precoExibicao && (
            <span className="block text-[10px] font-semibold text-slate-400 line-through">
              R$ {precoOriginalExibicao.toFixed(2).replace('.', ',')}
            </span>
          )}
          <span className="block text-sm font-black text-[#480404]">
            R$ {precoExibicao.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      {/* Botão: EDITAR para o Gerente | ADICIONAR para o Cliente */}
      {isGerente ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.()
          }}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-600 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-700 active:scale-[0.98]"
        >
          <Pencil size={14} />
          <span>Editar</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onAddToCart}
          disabled={esgotado}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#480404] py-2 text-xs font-bold text-white transition-colors hover:bg-[#660606] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300"
        >
          <ShoppingCart size={14} />
          <span>{esgotado ? 'Indisponível' : 'Adicionar'}</span>
        </button>
      )}
    </div>
  )
}