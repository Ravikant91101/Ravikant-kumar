
import React, { useState, useMemo } from 'react';
import { Search, MessageSquare, Calendar, FileText, RotateCcw } from 'lucide-react';
import { Invoice, Customer } from '../types';

const WeeklyStatement: React.FC<{ invoices: Invoice[], customers: Customer[] }> = ({ invoices, customers }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const defaultFrom = new Date(); defaultFrom.setDate(defaultFrom.getDate() - 7);
  const [fromDate, setFromDate] = useState<string>(defaultFrom.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const filteredInvoices = useMemo(() => {
    if (!selectedCustomerId) return [];
    const start = new Date(fromDate); start.setHours(0,0,0,0);
    const end = new Date(toDate); end.setHours(23,59,59,999);
    return invoices
      .filter(inv => inv.customerId === selectedCustomerId && new Date(inv.date) >= start && new Date(inv.date) <= end)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomerId, fromDate, toDate, invoices]);

  const stats = useMemo(() => {
    const grossSales = filteredInvoices.reduce((sum, inv) => sum + (inv.subTotal || inv.grandTotal), 0);
    const totalReturns = filteredInvoices.reduce((sum, inv) => sum + (inv.returnTotal || 0), 0);
    const netBilled = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const paid = filteredInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const balance = filteredInvoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0);
    return { grossSales, totalReturns, netBilled, paid, balance };
  }, [filteredInvoices]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const shareStatement = () => {
    if (!selectedCustomer) return;
    const text = encodeURIComponent(
      `*DIVYA GOLD STATEMENT SUMMARY*\n` +
      `Client: ${selectedCustomer.name}\n` +
      `Period: ${fromDate} to ${toDate}\n` +
      `--------------------------\n` +
      `Total Sales: ₹${stats.grossSales.toFixed(2)}\n` +
      `Total Returns: -₹${stats.totalReturns.toFixed(2)}\n` +
      `*Net Billed: ₹${stats.netBilled.toFixed(2)}*\n` +
      `*Total Received: ₹${stats.paid.toFixed(2)}*\n` +
      `*Balance Due: ₹${stats.balance.toFixed(2)}*\n` +
      `--------------------------\n` +
      `Thank you!`
    );
    window.open(`https://wa.me/${selectedCustomer.phone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <h3 className="text-2xl font-black text-slate-900">Weekly Statement (Deducting Returns)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <select className="p-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
            <option value="">-- Choose Account --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" className="p-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input type="date" className="p-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>

      {selectedCustomerId && filteredInvoices.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {filteredInvoices.map(inv => (
              <div key={inv.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Calendar size={18} /></div>
                  <div>
                    <div className="font-black text-slate-800 text-sm">{inv.id} • {new Date(inv.date).toLocaleDateString()}</div>
                    <div className="text-[10px] font-bold text-rose-500 uppercase">Returns: ₹{inv.returnTotal.toFixed(2)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600">Net: ₹{inv.grandTotal.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Summary Settlement</h4>
            <div className="space-y-4 border-b border-white/10 pb-8">
              <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold uppercase">Total Purchases</span><span className="font-black">₹{stats.grossSales.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-rose-400 font-bold uppercase">Total Returns (-)</span><span className="font-black">₹{stats.totalReturns.toFixed(2)}</span></div>
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Net Pending Balance</span>
              <div className="text-5xl font-black tracking-tighter text-rose-400">₹{stats.balance.toFixed(2)}</div>
            </div>
            <button onClick={shareStatement} className="w-full bg-emerald-500 text-white p-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all">
              <MessageSquare size={20} /> Share Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyStatement;
