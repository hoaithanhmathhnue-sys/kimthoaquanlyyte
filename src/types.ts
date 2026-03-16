export type Role = 'admin' | 'storekeeper' | 'medical_staff';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Medicine {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  minStock: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  email: string;
}

export interface Batch {
  id: string;
  medicineId: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  supplierId: string;
  importPrice: number;
  createdAt: string;
}

export type TransactionType = 'IMPORT' | 'EXPORT' | 'DISPENSE' | 'TRANSFER';

export interface Transaction {
  id: string;
  type: TransactionType;
  batchId: string;
  quantity: number;
  date: string;
  userId: string;
  note?: string;
  patientName?: string; // Only for DISPENSE
  department?: string; // Only for TRANSFER/EXPORT
}

export interface AppState {
  users: User[];
  categories: Category[];
  medicines: Medicine[];
  suppliers: Supplier[];
  batches: Batch[];
  transactions: Transaction[];
  currentUser: User | null;
}
