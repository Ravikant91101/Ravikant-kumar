
import React, { useState } from 'react';
import { Search, Trash2, Calendar, MessageSquare, Eye, X, Package, CreditCard, Receipt } from 'lucide-react';
import { Invoice, PaymentStatus } from '../types';
import { storage } from '../utils/storage';

const InvoiceList: React.FC<{ invoices: Invoice[], onUpdate: () => void }> = ({ invoices, onUpdate }) => {
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly'>('all');
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const share = (inv: Invoice) => {
    const text = encodeURIComponent(
      `*INVOICE ${inv.id}*\n` +
      `--------------------------\n` +
      `Date: ${new Date(inv.date).toLocaleDateString()}\n` +
      `Customer: ${inv.customerName}\n` +
      `Items:\n${inv.items.map(i => `- ${i.name} (x${i.quantity}): ₹${i.total}`).join('\n')}\n` +
      `--------------------------\n` +
      `*GRAND TOTAL: ₹${inv.grandTotal.toFixed(2)}*\n` +
      `*PAID: ₹${(inv.amountPaid || 0).toFixed(2)}*\n` +
      `*BALANCE: ₹${(inv.balanceAmount || 0).toFixed(2)}*\n\n` +
      `_Thank you!_`
    );
    window.open(`https://wa.me/${inv.customerPhone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  const filtered = invoices.filter(i => {
    const match = i.customerName.toLowerCase().includes(search.toLowerCase()) || i.id.includes(search);
    if (filter === 'daily') return match && new Date(i.date).toDateString() === new Date().toDateString();
    if (filter === 'weekly') {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return match && new Date(i.date) >= weekAgo;
    }
    return match;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[2.5rem] outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-slate-800" placeholder="Filter invoices by ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex bg-slate-100 p-2 rounded-[2.5rem] border border-slate-200">
          {(['all', 'daily', 'weekly'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === f ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-[0.3em] font-black">
              <tr>
                <th className="p-10">Invoice</th>
                <th className="p-10">Client</th>
                <th className="p-10">Grand Total</th>
                <th className="p-10">Paid / Balance</th>
                <th className="p-10 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="p-10">
                    <div className="text-xl font-black text-slate-900">{inv.id}</div>
                    <div className="text-[9px] font-black text-emerald-500 mt-1 uppercase tracking-widest">{new Date(inv.date).toLocaleDateString()}</div>
                  </td>
                  <td className="p-10">
                    <div className="font-bold text-slate-800 text-lg">{inv.customerName}</div>
                    <div className="text-xs font-medium text-slate-400">{inv.customerPhone}</div>
                  </td>
                  <td className="p-10 font-black text-2xl text-slate-900 tracking-tighter">₹{inv.grandTotal.toFixed(2)}</td>
                  <td className="p-10">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-600">₹{(inv.amountPaid || 0).toFixed(2)}</div>
                        <div className="text-sm font-black text-rose-500">₹{(inv.balanceAmount || 0).toFixed(2)}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        inv.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-600' : 
                        inv.paymentStatus === PaymentStatus.PARTIAL ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {inv.paymentStatus}
                      </div>
                    </div>
                  </td>
                  <td className="p-10 text-right space-x-2">
                    <button onClick={() => setSelectedInvoice(inv)} className="p-4 bg-slate-900 text-white rounded-[1.25rem] hover:bg-emerald-600 transition-all"><Eye size={18} /></button>
                    <button onClick={() => share(inv)} className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.25rem] hover:bg-emerald-600 hover:text-white transition-all"><MessageSquare size={18} /></button>
                    <button onClick={() => { storage.saveInvoices(invoices.filter(i => i.id !== inv.id)); onUpdate(); }} className="p-4 bg-slate-50 text-slate-300 hover:bg-rose-500 hover:text-white rounded-[1.25rem] transition-all"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-1 block">Bill Breakdown</span>
                <h3 className="text-2xl font-black">{selectedInvoice.id}</h3>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-rose-500 transition-all"><X size={24} /></button>
            </div>

            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 border-b border-slate-100 pb-8">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Customer</span>
                  <div className="text-lg font-black text-slate-900">{selectedInvoice.customerName}</div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                  <div className={`text-sm font-black uppercase tracking-widest ${
                    selectedInvoice.paymentStatus === PaymentStatus.PAID ? 'text-emerald-500' : 
                    selectedInvoice.paymentStatus === PaymentStatus.PARTIAL ? 'text-amber-500' : 'text-rose-500'
                  }`}>{selectedInvoice.paymentStatus}</div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block px-2">Purchase List</span>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <div className="font-black text-slate-800 text-sm">{item.name}</div>
                        <div className="text-[10px] font-bold text-slate-400">Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                      <div className="font-black text-slate-900">₹{item.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] space-y-4 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bill Total</span>
                  <span className="text-2xl font-black">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Amount Paid</span>
                  <span className="text-xl font-black">₹{(selectedInvoice.amountPaid || 0).toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="flex justify-between items-center text-rose-400">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Pending Balance</span>
                  <span className="text-2xl font-black">₹{(selectedInvoice.balanceAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
