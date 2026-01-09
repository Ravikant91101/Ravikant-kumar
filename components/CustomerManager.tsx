
import React, { useState } from 'react';
// Added missing 'Users' icon import from lucide-react
import { UserPlus, Search, Phone, MapPin, Users } from 'lucide-react';
import { Customer } from '../types';
import { storage } from '../utils/storage';

const CustomerManager: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [list, setList] = useState<Customer[]>(storage.getCustomers());
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust: Customer = { ...formData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updated = [...list, newCust];
    storage.saveCustomers(updated);
    setList(updated);
    setIsAdding(false);
    onUpdate();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-medium" placeholder="Search customer records..." />
        </div>
        <button onClick={() => setIsAdding(true)} className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
          <UserPlus size={20} /> Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {list.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex p-8 bg-slate-100 rounded-full mb-6">
              <Users size={48} className="text-slate-300" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-2">No customers found</h4>
            <p className="text-slate-500">Start adding clients to your business records.</p>
          </div>
        )}
        {list.map(c => (
          <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-lg shadow-slate-200">
                {c.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg leading-tight group-hover:text-emerald-600 transition-colors">{c.name}</h4>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {c.id.slice(-4)}</span>
              </div>
            </div>
            <div className="space-y-3 text-sm font-semibold text-slate-500">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                <Phone size={16} className="text-emerald-500" /> 
                {c.phone}
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                <MapPin size={16} className="text-emerald-500 mt-0.5" /> 
                <span className="leading-relaxed line-clamp-1">{c.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl space-y-8 animate-in zoom-in-95 duration-200 border border-white/20">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">New Client Profile</h3>
            <div className="space-y-4">
              <input required className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-emerald-500 font-bold transition-all" placeholder="Full Business Name" onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-emerald-500 font-bold transition-all" placeholder="Phone Number" onChange={e => setFormData({...formData, phone: e.target.value})} />
              <textarea required className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-emerald-500 font-bold transition-all" placeholder="Complete Billing Address" rows={3} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 p-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
              <button type="submit" className="flex-1 bg-emerald-600 text-white p-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all">Create Profile</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;
