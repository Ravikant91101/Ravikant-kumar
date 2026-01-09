
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Receipt, 
  History, 
  Menu, 
  X,
  Bell,
  FileText
} from 'lucide-react';
import { View, Customer, Product, Invoice } from './types';
import { storage } from './utils/storage';
import Dashboard from './components/Dashboard';
import CustomerManager from './components/CustomerManager';
import ProductManager from './components/ProductManager';
import BillingForm from './components/BillingForm';
import InvoiceList from './components/InvoiceList';
import WeeklyStatement from './components/WeeklyStatement';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setCustomers(storage.getCustomers());
    setProducts(storage.getProducts());
    setInvoices(storage.getInvoices());
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'New Bill', icon: Receipt },
    { id: 'statements', label: 'Weekly Bill', icon: FileText },
    { id: 'invoices', label: 'History', icon: History },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard invoices={invoices} customers={customers} products={products} />;
      case 'customers': return <CustomerManager onUpdate={refreshData} />;
      case 'products': return <ProductManager onUpdate={refreshData} />;
      case 'billing': return <BillingForm onUpdate={refreshData} customers={customers} products={products} onComplete={() => setActiveView('invoices')} />;
      case 'invoices': return <InvoiceList invoices={invoices} onUpdate={refreshData} />;
      case 'statements': return <WeeklyStatement invoices={invoices} customers={customers} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Dark Graphite theme */}
      <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'}
        transition-all duration-300 bg-zinc-900 border-r border-zinc-800 flex flex-col z-50
      `}>
        <div className="p-8 flex items-center gap-3">
          <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
            <Receipt className="text-white" size={24} />
          </div>
          {isSidebarOpen && <span className="text-2xl font-black text-white tracking-tight whitespace-nowrap">Divya Gold</span>}
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as View)}
                className={`
                  w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all
                  ${isActive ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}
                `}
              >
                <Icon size={20} />
                {isSidebarOpen && <span className="font-bold text-[11px] uppercase tracking-[0.2em]">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-8 text-zinc-500 hover:text-zinc-300 border-t border-zinc-800 flex justify-center"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10">
          <h2 className="text-3xl font-black text-slate-800 capitalize tracking-tight">{activeView === 'statements' ? 'Weekly Final Bills' : activeView}</h2>
          <div className="flex items-center gap-8">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Active Terminal</span>
              <span className="font-bold text-slate-400 text-xs">HQ-ADMIN-01</span>
            </div>
            <button className="text-slate-400 hover:text-emerald-600 transition-colors p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100">
              <Bell size={20} />
            </button>
            <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-slate-200">
              DG
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
