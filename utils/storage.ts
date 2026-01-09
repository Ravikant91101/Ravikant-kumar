
import { Customer, Product, Invoice } from '../types';

const KEYS = {
  CUSTOMERS: 'bm_customers',
  PRODUCTS: 'bm_products',
  INVOICES: 'bm_invoices'
};

export const storage = {
  getCustomers: (): Customer[] => JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]'),
  saveCustomers: (data: Customer[]) => localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(data)),
  
  getProducts: (): Product[] => JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
  saveProducts: (data: Product[]) => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(data)),
  
  getInvoices: (): Invoice[] => JSON.parse(localStorage.getItem(KEYS.INVOICES) || '[]'),
  saveInvoices: (data: Invoice[]) => localStorage.setItem(KEYS.INVOICES, JSON.stringify(data))
};
