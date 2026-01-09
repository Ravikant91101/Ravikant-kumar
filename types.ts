
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export enum PaymentStatus {
  PAID = 'Paid',
  PARTIAL = 'Partial',
  PENDING = 'Pending'
}

export enum PaymentMethod {
  CASH = 'Cash',
  UPI = 'UPI',
  CARD = 'Card',
  TRANSFER = 'Transfer'
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  returnItems: InvoiceItem[]; // Added for tracking returns
  subTotal: number;
  returnTotal: number; // Total value of items returned
  tax: number;
  grandTotal: number;
  amountPaid: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  date: string;
}

export type View = 'dashboard' | 'billing' | 'invoices' | 'customers' | 'products' | 'statements';
