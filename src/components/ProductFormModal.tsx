import { useState, useEffect } from 'react'
import { X, Package, Tag, DollarSign, Image as ImageIcon, Building } from 'lucide-react'
import type { Product } from './ProductCard'

type ProductFormModalProps = {
  isOpen: boolean
  onClose: () => void
  /** Persiste o produto na API. Lança Error com a mensagem a exibir se falhar. */
  onSave: (productData: Partial<Product>) => Promise<void>
  productToEdit?: Product | null
}

const FORM_VAZIO = {
  nome: '',
  categoria: 'Alimentos',
  marca: '',
  sku: '',
  precoVenda: '',
  precoOriginal: '',
  descontoPercentual: '',
  estoqueFisico: '0',
  imagemUrl: ''
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSave,
  productToEdit
}: ProductFormModalProps) {
  const [formData, setFormData] = useState(FORM_VAZIO)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  // Reinicia o formulário sempre que o modal abre/troca de produto
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setErro('')
    setSaving(false)
    if (productToEdit) {
      const precoV = productToEdit.precoVenda ?? productToEdit.price ?? 0
      const precoO = productToEdit.precoOriginal ?? productToEdit.originalPrice ?? ''
      const desc = productToEdit.descontoPercentual ?? productToEdit.discountPercentage ?? ''

      setFormData({
        nome: productToEdit.nome || productToEdit.name || '',
        categoria: productToEdit.categoria || productToEdit.category || 'Alimentos',
        marca: productToEdit.marca || productToEdit.brand || '',
        sku: productToEdit.sku || '',
        precoVenda: precoV ? String(precoV) : '',
        precoOriginal: precoO ? String(precoO) : '',
        descontoPercentual: desc ? String(desc) : '',
        estoqueFisico: String(productToEdit.estoqueFisico ?? 0),
        imagemUrl: productToEdit.imagemUrl || productToEdit.image || productToEdit.imageUrl || ''
      })
    } else {
      setFormData(FORM_VAZIO)
    }
  }, [productToEdit, isOpen])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    const pVenda = parseFloat(formData.precoVenda.replace(',', '.'))
    const pOrig = formData.precoOriginal ? parseFloat(formData.precoOriginal.replace(',', '.')) : undefined
    const desc = formData.descontoPercentual ? parseInt(formData.descontoPercentual, 10) : 0
    const estoque = formData.estoqueFisico === '' ? 0 : parseInt(formData.estoqueFisico, 10)

    if (isNaN(pVenda) || pVenda <= 0) {
      setErro('Por favor, informe um preço de venda válido.')
      return
    }
    if (pOrig !== undefined && (isNaN(pOrig) || pOrig < 0)) {
      setErro('Preço original inválido.')
      return
    }
    if (isNaN(desc) || desc < 0 || desc > 100) {
      setErro('O desconto deve estar entre 0 e 100%.')
      return
    }
    if (isNaN(estoque) || estoque < 0) {
      setErro('O estoque deve ser um número inteiro maior ou igual a zero.')
      return
    }

    setSaving(true)
    try {
      // O id (UUID) é gerado pela API ao cadastrar; ao editar, reenviamos o existente.
      await onSave({
        ...(productToEdit ? { id: productToEdit.id } : {}),
        nome: formData.nome.trim(),
        categoria: formData.categoria,
        marca: formData.marca.trim(),
        sku: formData.sku.trim(),
        precoVenda: pVenda,
        precoOriginal: pOrig,
        descontoPercentual: desc,
        estoqueFisico: estoque,
        imagemUrl: formData.imagemUrl.trim()
      })
      onClose()
    } catch (err) {
      setErro(err instanceof Error && err.message ? err.message : 'Não foi possível salvar o produto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl my-8">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Cabeçalho */}
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#480404] text-white">
            <Package size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {productToEdit ? 'Editar Produto' : 'Adicionar Novo Produto'}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Preencha os dados do item para o catálogo de atacado
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          {/* Nome do Produto */}
          <div>
            <label className="block mb-1 font-bold text-slate-800">Nome do Produto *</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Achocolatado Nescau 370g"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
              />
            </div>
          </div>

          {/* Categoria e Marca */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold text-slate-800">Categoria *</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                >
                  <option value="Alimentos">Alimentos</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Higiene e Beleza">Higiene e Beleza</option>
                  <option value="Limpeza">Limpeza</option>
                  <option value="Mercearia">Mercearia</option>
                  <option value="Doces">Doces</option>
                  <option value="Utilitários">Utilitários</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-800">Marca / Fabricante</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  placeholder="Ex: Nestlé"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                />
              </div>
            </div>
          </div>

          {/* Preços e Desconto */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 font-bold text-slate-800">Preço Venda *</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  name="precoVenda"
                  required
                  value={formData.precoVenda}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-2 text-xs text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-800">Preço De (Original)</label>
              <input
                type="text"
                name="precoOriginal"
                value={formData.precoOriginal}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-xs text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-800">Desconto %</label>
              <input
                type="number"
                name="descontoPercentual"
                value={formData.descontoPercentual}
                onChange={handleChange}
                placeholder="Ex: 15"
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-xs text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
              />
            </div>
          </div>

          {/* SKU e Estoque */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold text-slate-800">SKU / Código</label>
              <input
                type="text"
                name="sku"
                maxLength={50}
                value={formData.sku}
                onChange={handleChange}
                placeholder="Ex: NES-370"
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-xs text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-slate-800">Estoque (unidades) *</label>
              <input
                type="number"
                name="estoqueFisico"
                min={0}
                step={1}
                required
                value={formData.estoqueFisico}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-xs text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
              />
            </div>
          </div>

          {/* URL da Imagem */}
          <div>
            <label className="block mb-1 font-bold text-slate-800">URL da Imagem</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="url"
                name="imagemUrl"
                value={formData.imagemUrl}
                onChange={handleChange}
                placeholder="https://exemplo.com/imagem.png"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
              />
            </div>
          </div>

          {erro && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-600">
              {erro}
            </div>
          )}

          {/* Botões */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 rounded-xl border border-slate-300 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-1/2 rounded-xl bg-[#480404] py-2.5 font-bold text-white hover:bg-[#660606] transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? 'Salvando...' : productToEdit ? 'Atualizar Produto' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}