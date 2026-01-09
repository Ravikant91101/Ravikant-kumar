
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, MessageSquare, ArrowRight, Calendar, Wallet, RotateCcw } from 'lucide-react';
import { Customer, Product, Invoice, InvoiceItem, PaymentStatus, PaymentMethod } from '../types';
import { storage } from '../utils/storage';

const BillingForm: React.FC<{ customers: Customer[], products: Product[], onUpdate: () => void, onComplete: () => void }> = ({ customers, products, onUpdate, onComplete }) => {
  const [selectedCustId, setSelectedCustId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([]);
  const [returnItems, setReturnItems] = useState<Partial<InvoiceItem>[]>([]); // State for returns
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<Invoice | null>(null);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, price: 0, total: 0 }]);
  const addReturnItem = () => setReturnItems([...returnItems, { productId: '', quantity: 1, price: 0, total: 0 }]);
  
  const updateItem = (index: number, pid: string, isReturn: boolean = false) => {
    const prod = products.find(p => p.id === pid);
    if (!prod) return;
    const list = isReturn ? [...returnItems] : [...items];
    list[index] = { 
      productId: pid, 
      name: prod.name, 
      price: prod.price, 
      quantity: 1, 
      total: prod.price 
    };
    isReturn ? setReturnItems(list) : setItems(list);
  };

  const updateQty = (index: number, q: number, isReturn: boolean = false) => {
    const list = isReturn ? [...returnItems] : [...items];
    const item = list[index];
    if (item.price) {
      item.quantity = q;
      item.total = q * item.price;
    }
    isReturn ? setReturnItems(list) : setItems(list);
  };

  const subTotal = items.reduce((s, i) => s + (i.total || 0), 0);
  const returnTotalValue = returnItems.reduce((s, i) => s + (i.total || 0), 0);
  const grandTotal = Math.max(0, subTotal - returnTotalValue);
  const balanceAmount = Math.max(0, grandTotal - paidAmount);

  useEffect(() => {
    if (paidAmount === 0 || paidAmount > grandTotal) {
      setPaidAmount(grandTotal);
    }
  }, [grandTotal]);

  const handleSave = () => {
    const customer = customers.find(c => c.id === selectedCustId);
    if (!customer) return alert('Please select a customer');
    if (items.length === 0 && returnItems.length === 0) return alert('Please add at least one item or return');

    const dateObj = new Date(selectedDate);
    const now = new Date();
    if (dateObj.toDateString() === now.toDateString()) {
      dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    }

    let status = PaymentStatus.PAID;
    if (paidAmount === 0 && grandTotal > 0) status = PaymentStatus.PENDING;
    else if (paidAmount < grandTotal) status = PaymentStatus.PARTIAL;

    const inv: Invoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      customerId: selectedCustId,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: items.filter(i => i.productId) as InvoiceItem[],
      returnItems: returnItems.filter(i => i.productId) as InvoiceItem[],
      subTotal: subTotal,
      returnTotal: returnTotalValue,
      tax: 0,
      grandTotal,
      amountPaid: paidAmount,
      balanceAmount: balanceAmount,
      paymentStatus: status,
      paymentMethod: PaymentMethod.CASH,
      date: dateObj.toISOString()
    };

    const current = storage.getInvoices();
    storage.saveInvoices([...current, inv]);
    setLastCreatedInvoice(inv);
    onUpdate();
  };

  const shareViaWhatsApp = (inv: Invoice) => {
    const text = encodeURIComponent(
      `*BILL GENERATED: ${inv.id}*\n` +
      `--------------------------\n` +
      `Customer: ${inv.customerName}\n` +
      `Items Total: ₹${inv.subTotal.toFixed(2)}\n` +
      (inv.returnTotal > 0 ? `Returns Ded: -₹${inv.returnTotal.toFixed(2)}\n` : '') +
      `*Grand Total: ₹${inv.grandTotal.toFixed(2)}*\n` +
      `*Paid: ₹${inv.amountPaid.toFixed(2)}*\n` +
      `*Bal: ₹${inv.balanceAmount.toFixed(2)}*\n` +
      `--------------------------\n` +
      `Thank you!`
    );
    window.open(`https://wa.me/${inv.customerPhone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  if (lastCreatedInvoice) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in zoom-in-95 duration-300">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl text-center space-y-8 relative overflow-hidden">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="text-white" size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Bill Created</h2>
            <p className="text-slate-400 font-medium">Invoice {lastCreatedInvoice.id} recorded with return deductions.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Return Deducted</span>
              <span className="text-2xl font-black text-rose-500 tracking-tighter">₹{lastCreatedInvoice.returnTotal.toFixed(2)}</span>
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Final Total</span>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{lastCreatedInvoice.grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => shareViaWhatsApp(lastCreatedInvoice)} className="flex items-center justify-center gap-3 bg-emerald-500 text-white p-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl transition-all">
              <MessageSquare size={20} /> Share Bill
            </button>
            <button onClick={() => setLastCreatedInvoice(null)} className="flex items-center justify-center gap-3 bg-slate-900 text-white p-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
              <Plus size={20} /> New Bill
            </button>
          </div>
          <button onClick={onComplete} className="w-full p-4 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.4em]">
            History <ArrowRight size={14} className="inline ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Client</h3>
            <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold text-slate-700" value={selectedCustId} onChange={(e) => setSelectedCustId(e.target.value)}>
              <option value="">-- Choose Account --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Date</h3>
            <input type="date" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold text-slate-700" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>

        {/* Purchase Items */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800">New Purchase</h3>
            <button onClick={addItem} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-emerald-600 transition-all">
              <Plus size={16} /> Add Entry
            </button>
          </div>
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <div className="flex-1 min-w-[200px]">
                  <select className="w-full p-3 bg-white border border-slate-200 rounded-2xl font-bold" value={item.productId} onChange={(e) => updateItem(idx, e.target.value)}>
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-2xl font-bold text-center" value={item.quantity === 0 ? '' : item.quantity} onFocus={(e) => e.target.select()} onChange={(e) => updateQty(idx, parseInt(e.target.value) || 0)} />
                </div>
                <div className="w-32 p-3 font-black text-slate-900 bg-slate-100 rounded-2xl text-center">₹{(item.total || 0).toFixed(0)}</div>
                <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Return Items Section */}
        <div className="bg-rose-50/30 p-10 rounded-[2.5rem] border border-rose-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-rose-800">Product Return (Vapas)</h3>
            <button onClick={addReturnItem} className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-rose-600 transition-all">
              <RotateCcw size={16} /> Add Return
            </button>
          </div>
          <div className="space-y-4">
            {returnItems.length === 0 && <p className="text-[10px] text-rose-300 font-bold uppercase tracking-widest text-center py-4">No returns added</p>}
            {returnItems.map((item, idx) => (
              <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-white p-4 rounded-3xl border border-rose-100">
                <div className="flex-1 min-w-[200px]">
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={item.productId} onChange={(e) => updateItem(idx, e.target.value, true)}>
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-center" value={item.quantity === 0 ? '' : item.quantity} onFocus={(e) => e.target.select()} onChange={(e) => updateQty(idx, parseInt(e.target.value) || 0, true)} />
                </div>
                <div className="w-32 p-3 font-black text-rose-600 bg-rose-50 rounded-2xl text-center">₹{(item.total || 0).toFixed(0)}</div>
                <button onClick={() => setReturnItems(returnItems.filter((_, i) => i !== idx))} className="text-rose-200 hover:text-rose-600 p-2"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Column */}
      <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-8 h-fit">
        <h3 className="text-2xl font-black">Settlement</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-slate-400 font-bold text-xs uppercase tracking-widest">
            <span>Subtotal Items</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-rose-400 font-bold text-xs uppercase tracking-widest">
            <span>Returns Ded. (-)</span>
            <span>₹{returnTotalValue.toFixed(2)}</span>
          </div>
          <div className="h-px bg-slate-800" />
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-black uppercase text-slate-500">Net Total</span>
            <span className="text-4xl font-black">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-emerald-500">Amount Received</label>
          <input type="number" className="w-full p-5 bg-slate-800 border border-slate-700 rounded-3xl font-black text-2xl text-white outline-none focus:border-emerald-500" value={paidAmount === 0 ? '' : paidAmount} onFocus={(e) => e.target.select()} onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} />
        </div>
        <button onClick={handleSave} className="w-full bg-emerald-500 p-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl">
          Confirm Bill
        </button>
      </div>
    </div>
  );
};

export default BillingForm;
