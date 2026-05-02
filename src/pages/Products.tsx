import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Search, Filter, Trash2, Edit, Loader2, MoreHorizontal, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, (formData as any)[key]));
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(f => data.append('images', f));
    }
    try {
      await axios.post('/api/products', data);
      setShowAddModal(false);
      fetchData();
      setFormData({ name: '', description: '', price: '', stock: '', categoryId: '1', discountType: 'percentage', discountValue: '0' });
      setSelectedFiles(null);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this product?')) {
      await axios.delete(`/api/products/${id}`);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Products</h1><p className="text-gray-500">Manage your catalog</p></div>
        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus size={18}/> Add Product
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
          <input className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl" placeholder="Search..."/>
        </div>
      </div>

      {loading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600"/></div> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded border overflow-hidden">
                        {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover"/>}
                      </div>
                      <span className="font-bold text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{p.Category?.name}</td>
                  <td className="px-6 py-4 text-sm">${p.finalPrice?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">{p.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/50" />
            <motion.form initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} onSubmit={handleSubmit} className="relative bg-white w-full max-w-lg rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold">Add Product</h2>
              <input required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full border p-2 rounded" placeholder="Name"/>
              <textarea value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} className="w-full border p-2 rounded" placeholder="Description"/>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} className="border p-2 rounded" placeholder="Price"/>
                <input required type="number" value={formData.stock} onChange={e=>setFormData({...formData, stock:e.target.value})} className="border p-2 rounded" placeholder="Stock"/>
              </div>
              <input type="file" multiple onChange={e=>setSelectedFiles(e.target.files)} className="border p-2 w-full"/>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setShowAddModal(false)} className="px-4 py-2">Cancel</button>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Save</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
