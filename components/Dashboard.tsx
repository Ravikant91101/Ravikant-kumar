
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Package, Sparkles, Wallet, ReceiptText, ArrowDownLeft, RotateCcw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Invoice, Customer, Product } from '../types';
import { GoogleGenAI } from "@google/genai";

const Dashboard: React.FC<{ invoices: Invoice[], customers: Customer[], products: Product[] }> = ({ invoices, customers, products }) => {
  const [insight, setInsight] = useState<string>('Analyzing your sales patterns...');

  useEffect(() => {
    const fetchInsight = async () => {
      if (invoices.length === 0) return setInsight("Create some invoices to see AI insights.");
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analyze these recent invoice summaries: ${JSON.stringify(invoices.slice(-5).map(i => ({ date: i.date, total: i.grandTotal, returns: i.returnTotal })))}. Give one short business strategy tip in 20 words regarding returns management or sales.`
        });
        setInsight(response.text || 'No insights available yet.');
      } catch (e) {
        setInsight('AI Assistant is currently busy.');
      }
    };
    fetchInsight();
  }, [invoices]);

  const today = new Date().toDateString();
  const todayInvoices = invoices.filter(i => new Date(i.date).toDateString() === today);
  
  const dailyTotal = todayInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const dailyCollection = todayInvoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const dailyReturns = todayInvoices.reduce((s, i) => s + (i.returnTotal || 0), 0);
  
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const weeklyTotal = invoices.filter(i => new Date(i.date) >= last7Days).reduce((s, i) => s + i.grandTotal, 0);

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayInvoices = invoices.filter(inv => new Date(inv.date).toDateString() === d.toDateString());
    return { 
      name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
      total: dayInvoices.reduce((s, inv) => s + inv.grandTotal, 0),
      returns: dayInvoices.reduce((s, inv) => s + (inv.returnTotal || 0), 0)
    };
  });

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white shadow-2xl border border-zinc-800 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="bg-emerald-500/20 p-6 rounded-[2.5rem] border border-emerald-500/30 shrink-0">
          <Sparkles className="text-emerald-400" size={32} />
        </div>
        <div className="relative flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-emerald-500"></span>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">Divya AI Insights</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white">"{insight}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Sales Today" value={`₹${dailyTotal.toLocaleString('en-IN')}`} icon={<ReceiptText size={20} />} color="slate" />
        <StatCard label="Returns Today" value={`₹${dailyReturns.toLocaleString('en-IN')}`} icon={<RotateCcw size={20} />} color="rose" description="Value of returns today" highlight={dailyReturns > 0} />
        <StatCard label="Money Received" value={`₹${dailyCollection.toLocaleString('en-IN')}`} icon={<ArrowDownLeft size={20} />} color="emerald" highlight />
        <StatCard label="Weekly Sales" value={`₹${weeklyTotal.toLocaleString('en-IN')}`} icon={<TrendingUp size={20} />} color="cyan" />
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-900 mb-10">Sales vs Returns (Weekly)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dx={-10} />
              <Tooltip formatter={(value: number) => [`₹${value}`, '']} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={4} fill="#10b98110" />
              <Area type="monotone" dataKey="returns" stroke="#ef4444" strokeWidth={4} fill="#ef444410" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, description, highlight }: any) => (
  <div className={`bg-white p-8 rounded-[2rem] border ${highlight ? `border-${color}-200 bg-${color}-50/10` : 'border-slate-100'} shadow-sm transition-all hover:-translate-y-1`}>
    <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center mb-6 text-${color}-600`}>{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black ${highlight ? `text-${color}-600` : 'text-slate-900'}`}>{value}</p>
    {description && <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{description}</p>}
  </div>
);

export default Dashboard;
