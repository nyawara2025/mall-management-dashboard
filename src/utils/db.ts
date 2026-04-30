import { openDB, IDBPDatabase } from 'idb';

// Define the shape of your Product (matching your Supabase/n8n data)
export interface Product {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  image_url?: string;
  shop_id: string;
}

// Define the shape of a Sale for the Outbox
export interface OfflineSale {
  id?: number;
  cart: any[];
  total: number;
  payment_method: 'CASH' | 'M-PESA';
  shop_id: string;
  timestamp: string;
}

const DB_NAME = 'pos_database';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('products')) {
      db.createObjectStore('products', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('offline_sales')) {
      db.createObjectStore('offline_sales', { keyPath: 'id', autoIncrement: true });
    }
  },
});

// --- TYPE-SAFE HELPER FUNCTIONS ---

export const saveProductsLocally = async (products: Product[]): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction('products', 'readwrite');
  await Promise.all(products.map(p => tx.store.put(p)));
  await tx.done;
};

export const getLocalProducts = async (): Promise<Product[]> => {
  const db = await dbPromise;
  return db.getAll('products');
};

export const saveOfflineSale = async (sale: Omit<OfflineSale, 'id'>): Promise<number> => {
  const db = await dbPromise;
  return db.add('offline_sales', sale) as Promise<number>;
};

export const getPendingSales = async (): Promise<OfflineSale[]> => {
  const db = await dbPromise;
  return db.getAll('offline_sales');
};

export const deleteSyncedSale = async (id: number): Promise<void> => {
  const db = await dbPromise;
  return db.delete('offline_sales', id);
};
