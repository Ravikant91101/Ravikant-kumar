
import React, { useState } from 'react';
import { PackagePlus, Tag, Trash2, Box } from 'lucide-react';
import { Product } from '../types';
import { storage } from '../utils/storage';

const ProductManager: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [list, setList] = useState<Product[]>(storage.getProducts());
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', unit: 'pcs' });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const p: Product = { id: Date.now().toString(), name: form.name, price: parseFloat(form.price) || 0, unit: form.unit };
    const updated = [...list, p];
    storage.saveProducts(updated);
    setList(updated);
    setIsAdding(false);
    onUpdate();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
          <PackagePlus size={20} /> Add Inventory
        </button>
      </div>

      <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-[0.3em] font-black">
              <tr>
                <th className="p-10">Stock Item</th>
                <th className="p-10">Unit Pricing</th>
                <th className="p-10">Metric</th>
                <th className="p-10 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No products in inventory</td>
                </tr>
              )}
              {list.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="p-10 font-black text-slate-900 flex items-center gap-5">
                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <Box size={20} />
                    </div>
                    <div>
                      <div className="text-lg leading-tight">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: #{p.id.slice(-4)}</div>
                    </div>
                  </td>
                  <td className="p-10 text-slate-900 font-black text-xl tracking-tight">₹{p.price.toFixed(2)}</td>
                  <td className="p-10">
                    <span className="px-5 py-2 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                      {p.unit}
                    </span>
                  </td>
                  <td className="p-10 text-right">
                    <button onClick={() => {
                      const u = list.filter(i => i.id !== p.id);
                      storage.saveProducts(u);
                      setList(u);
                      onUpdate();
                    }} className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl space-y-10 border border-white/20">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Stock Registration</h3>
            <div className="space-y-4">
              <input required className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-emerald-500 font-bold transition-all" placeholder="Item Name (e.g. MacBook Pro)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <div className="flex gap-4">
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  className="flex-1 p-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-emerald-500 font-bold transition-all" 
                  placeholder="Price (in ₹)" 
                  // Fix: Removed invalid comparison between string and number (0). 
                  // Since form.price is a string state, we check if it is explicitly '0' or empty to show placeholder.
                  value={form.price === '0' || form.price === '' ? '' : form.price}
                  onFocus={(e) => e.target.select()}
                  onChange={e => setForm({...form, price: e.target.value})} 
                />
                <select className="w-40 p-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-emerald-500 font-bold transition-all cursor-pointer" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                  <option value="pcs">Pcs</option>
                  <option value="kg">Kg</option>
                  <option value="ltr">Ltr</option>
                  <option value="box">Box</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 p-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 bg-slate-900 text-white p-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-300 hover:bg-emerald-600 transition-all">Add to Stock</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
