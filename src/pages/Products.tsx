import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Loader2, 
  Image as ImageIcon, 
  X, 
  Eye, 
  Tag, 
  History, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'view'; data?: any } | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock: '', categoryId: '1', discountType: 'percentage', discountValue: '0',
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([axios.get('/api/products'), axios.get('/api/categories')]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleOpenEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId.toString(),
      discountType: product.discountType,
      discountValue: product.discountValue.toString(),
    });
    setModalState({ type: 'edit', data: product });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, (formData as any)[key]));
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(f => data.append('images', f));
    }

    try {
      if (modalState?.type === 'edit') {
        await axios.put(`/api/products/${modalState.data.id}`, data);
      } else {
        await axios.post('/api/products', data);
      }
      setModalState(null);
      fetchData();
      resetForm();
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: '1', discountType: 'percentage', discountValue: '0' });
    setSelectedFiles(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await axios.delete(`/api/products/${id}`);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Catalog</h1>
          <p className="text-slate-500">Manage, monitor and update your inventory.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setModalState({ type: 'add' }); }} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20}/> New Product
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20}/>
          <input className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Search product name, category or SKU..."/>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-sm flex items-center gap-2">
            <Tag size={18}/> Categories
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center gap-4 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="animate-spin text-indigo-600" size={40}/>
          <p className="text-slate-500 font-medium">Syncing inventory...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-black tracking-widest">
              <tr>
                <th className="px-6 py-5">Product Details</th>
                <th className="px-6 py-5">Summary</th>
                <th className="px-6 py-5">Pricing (PKR)</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative shadow-sm">
                        {p.images?.[0] ? (
                          <img src={p.images[0].startsWith('http') ? p.images[0] : p.images[0]} className="w-full h-full object-cover"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                            <ImageIcon size={20}/>
                          </div>
                        )}
                        {p.discountValue > 0 && (
                          <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-br-lg">
                            {p.discountValue}% OFF
                          </div>
                        )}
                      </div>
                      <div className="max-w-[200px]">
                        <span className="font-bold text-slate-900 block truncate">{p.name}</span>
                        <span className="text-xs text-slate-400 font-medium">{p.Category?.name || 'Uncategorized'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-black text-slate-900">Rs. {Math.round(p.finalPrice).toLocaleString()}</p>
                      {p.discountValue > 0 && (
                         <p className="text-xs text-slate-400 line-through">Rs. {p.price.toLocaleString()}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                      p.stock > 10 ? "bg-emerald-50 text-emerald-600" : p.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", p.stock > 10 ? "bg-emerald-600" : p.stock > 0 ? "bg-amber-600" : "bg-red-600")}></div>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setModalState({ type: 'view', data: p })}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Eye size={18}/>
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(p)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit size={18}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="py-20 text-center bg-slate-50">
              <Package className="mx-auto text-slate-200 mb-4" size={64}/>
              <h3 className="text-lg font-bold text-slate-900">No Inventory Found</h3>
              <p className="text-slate-500">Get started by adding your first product to the catalog.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Overlay */}
      <AnimatePresence>
        {modalState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={() => setModalState(null)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{scale:0.95, opacity:0, y:20}} 
              animate={{scale:1, opacity:1, y:0}} 
              exit={{scale:0.95, opacity:0, y:20}} 
              className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 capitalize">
                  {modalState.type === 'view' ? 'Product Details' : modalState.type === 'edit' ? 'Update Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setModalState(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={24}/>
                </button>
              </div>

              {modalState.type === 'view' ? (
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
                         <img src={modalState.data.images[0]} className="w-full h-full object-cover"/>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {modalState.data.images.map((img: string, i: number) => (
                           <div key={i} className="aspect-square bg-slate-100 rounded-xl overflow-hidden border">
                              <img src={img} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all cursor-pointer"/>
                           </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-full">{modalState.data.Category?.name}</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 leading-tight">{modalState.data.name}</h3>
                        <p className="text-slate-500 mt-4 leading-relaxed italic">"{modalState.data.description}"</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-slate-500 font-bold">List Price</span>
                          <span className="text-2xl font-black text-indigo-600">Rs. {Math.round(modalState.data.finalPrice).toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                             <p className="text-xs text-slate-400 font-bold">Stock Status</p>
                             <p className="text-lg font-bold text-slate-900">{modalState.data.stock} Units</p>
                           </div>
                           <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                             <p className="text-xs text-slate-400 font-bold">Total Sales</p>
                             <p className="text-lg font-bold text-slate-900">42 Products</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                      <input required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl transition-colors outline-none font-medium" placeholder="e.g. Maria.B Pakistani Suit"/>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                      <textarea rows={3} value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl transition-colors outline-none font-medium" placeholder="Tell customers about the fabric, work, and sizing..."/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Price (PKR)</label>
                      <input required type="number" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl outline-none font-medium" placeholder="0.00"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Stock Inventory</label>
                      <input required type="number" value={formData.stock} onChange={e=>setFormData({...formData, stock:e.target.value})} className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl outline-none font-medium" placeholder="0"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                      <select value={formData.categoryId} onChange={e=>setFormData({...formData, categoryId:e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none font-medium bg-white">
                        {categories.map((c, i) => <option key={i} value={i+1}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Discount (%)</label>
                      <input type="number" value={formData.discountValue} onChange={e=>setFormData({...formData, discountValue:e.target.value})} className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl outline-none font-medium" placeholder="0"/>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Product Images</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                      <input type="file" multiple onChange={e=>setSelectedFiles(e.target.files)} className="hidden" id="file-upload"/>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <ImageIcon className="mx-auto text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors" size={32}/>
                        <p className="text-sm font-bold text-slate-900">Click to upload photos</p>
                        <p className="text-xs text-slate-500 mt-1">Upload at least 1 high-quality image (JPG, PNG)</p>
                        {selectedFiles && (
                           <div className="mt-4 flex flex-wrap gap-2 justify-center">
                              {Array.from(selectedFiles).map((f, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-600 text-white text-[10px] rounded-full font-bold">{f.name}</span>
                              ))}
                           </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <button type="button" onClick={()=>setModalState(null)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900 transition-all">Discard</button>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                      {modalState.type === 'edit' ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
