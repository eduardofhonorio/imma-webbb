import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, ShieldCheck, ArrowLeft, Package } from 'lucide-react'
import type { Product } from './ProductCard'
import { ProductFormModal } from './ProductFormModal'

type AdminPageProps = {
  products: Product[]
  onAddProduct: (productData: Partial<Product>) => Promise<void>
  onUpdateProduct: (productData: Partial<Product>) => Promise<void>
  onDeleteProduct: (id: string | number) => Promise<void>
  onBackToHome: () => void
}

export function AdminPage({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBackToHome
}: AdminPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase().trim()
    const name = (p.nome || p.name || '').toLowerCase()
    const brand = (p.marca || p.brand || '').toLowerCase()
    const category = (p.categoria || p.category || '').toLowerCase()
    return name.includes(query) || brand.includes(query) || category.includes(query)
  })

  const handleOpenAdd = () => {
    setProductToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setProductToEdit(product)
    setIsModalOpen(true)
  }

  // Devolve a Promise para o modal só fechar (e mostrar erros) conforme o resultado da API
  const handleSave = (productData: Partial<Product>): Promise<void> =>
    productToEdit ? onUpdateProduct(productData) : onAddProduct(productData)

  return (
    <main className="min-h-[85vh] bg-slate-50/60 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Botão Voltar */}
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-bold text-[#480404] hover:underline focus:outline-none"
        >
          <ArrowLeft size={16} />
          Voltar para a Loja
        </button>

        {/* Cabeçalho do Painel */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#480404] text-white shadow-md">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Painel do Gerente</h1>
              <p className="text-xs font-semibold text-slate-500">
                Gestão completa de estoque e produtos do catálogo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#480404] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#660606] shadow-sm active:scale-[0.99]"
          >
            <Plus size={16} />
            <span>Adicionar Produto</span>
          </button>
        </div>

        {/* Barra de Busca e Contador */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, marca ou categoria..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#480404] focus:outline-none focus:ring-1 focus:ring-[#480404]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          </div>

          <span className="text-xs font-bold text-[#480404]">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
          </span>
        </div>

        {/* Tabela de Produtos */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Produto</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Marca</th>
                  <th className="py-3.5 px-4">Preço Venda</th>
                  <th className="py-3.5 px-4">Estoque</th>
                  <th className="py-3.5 px-4">Desconto</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const name = product.nome || product.name || 'Produto'
                    const category = product.categoria || product.category || '-'
                    const brand = product.marca || product.brand || '-'
                    const price = product.precoVenda ?? product.price ?? 0
                    const discount = product.descontoPercentual ?? product.discountPercentage
                    const img = product.imagemUrl || product.image || product.imageUrl

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {img ? (
                              <img
                                src={img}
                                alt={name}
                                className="h-10 w-10 object-contain rounded-lg border border-slate-100 bg-white p-1 shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-[#480404] shrink-0">
                                <Package size={16} />
                              </div>
                            )}
                            <span className="font-bold text-slate-900 line-clamp-1">{name}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600">{category}</td>
                        <td className="py-3 px-4 text-slate-600 uppercase text-[11px] font-bold">{brand}</td>
                        <td className="py-3 px-4 font-black text-[#480404]">
                          R$ {price.toFixed(2).replace('.', ',')}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={
                              (product.estoqueFisico ?? 0) <= 0
                                ? 'rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600'
                                : 'text-slate-700'
                            }
                          >
                            {(product.estoqueFisico ?? 0) <= 0 ? 'Esgotado' : product.estoqueFisico}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {discount ? (
                            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              -{discount}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(product)}
                              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-[#480404] transition-colors"
                              title="Editar Produto"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Deseja realmente remover o produto "${name}"?`)) {
                                  void onDeleteProduct(product.id)
                                }
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Excluir Produto"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-semibold">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Formulário */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        productToEdit={productToEdit}
      />
    </main>
  )
}