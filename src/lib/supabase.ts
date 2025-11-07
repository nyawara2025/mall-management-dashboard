// Direct fetch-based Supabase client - no complex query building
const SUPABASE_URL = 'https://ufrrlfcxuovxgizxuowh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcnJsZmN4dW92eGdpenh1b3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Mzc2NDgsImV4cCI6MjA2OTIxMzY0OH0.MfwxLihZ6htvufjYv3RLfKwKsazjD_TnVEcV1IDZeQg';

// Simple fetch wrapper for Supabase REST API
export class SupabaseClient {
  private url: string;
  private anonKey: string;

  constructor(url: string, anonKey: string) {
    this.url = url;
    this.anonKey = anonKey;
  }

  // Direct fetch method that returns { data, error }
  async query(table: string, operation: string = 'select', params: any = {}) {
    try {
      const headers = {
        'Authorization': `Bearer ${this.anonKey}`,
        'apikey': this.anonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };

      let url = `${this.url}/rest/v1/${table}`;
      let method = 'GET';
      let body = null;

      if (operation === 'select') {
        const queryParams = new URLSearchParams();
        if (params.columns && params.columns !== '*') {
          queryParams.append('select', params.columns);
        } else {
          queryParams.append('select', '*');
        }
        url += '?' + queryParams.toString();
      } else {
        method = operation.toUpperCase();
        body = JSON.stringify(params);
      }

      const response = await fetch(url, { method, headers, body });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: new Error(errorText) };
      }

      const data = await response.json();
      return { data, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  // Direct method calls (no complex chaining)
  async select(table: string, columns: string = '*') {
    return this.query(table, 'select', { columns });
  }

  async insert(table: string, data: any) {
    return this.query(table, 'insert', data);
  }

  async update(table: string, data: any) {
    return this.query(table, 'update', data);
  }

  async delete(table: string) {
    return this.query(table, 'delete');
  }

  // Simple from() method for compatibility
  from(table: string) {
    return {
      select: (columns: string = '*') => this.select(table, columns),
      insert: (data: any) => this.insert(table, data),
      update: (data: any) => this.update(table, data),
      delete: () => this.delete(table)
    };
  }
}

// Create and export instance
export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
