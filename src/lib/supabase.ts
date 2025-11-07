// Simple and working Supabase client
const SUPABASE_URL = 'https://ufrrlfcxuovxgizxuowh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcnJsZmN4dW92eGdpenh1b3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Mzc2NDgsImV4cCI6MjA2OTIxMzY0OH0.MfwxLihZ6htvufjYv3RLfKwKsazjD_TnVEcV1IDZeQg';

// Simple Supabase client that returns promises directly
class SupabaseClient {
  private url: string;
  private anonKey: string;

  constructor(url: string, anonKey: string) {
    this.url = url;
    this.anonKey = anonKey;
  }

  // Simple method that returns query builder with .then() support
  from(table: string) {
    return {
      // Simple select that returns a promise directly
      select: (columns: string = '*') => this.createSimpleQuery(table, 'select', columns),
      insert: (data: any) => this.createSimpleQuery(table, 'insert', data),
      update: (data: any) => this.createSimpleQuery(table, 'update', data),
      delete: () => this.createSimpleQuery(table, 'delete'),
    };
  }

  // Simple direct query that returns { data, error }
  private async createSimpleQuery(table: string, operation: string, params: any) {
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

      // Build query parameters for select
      if (operation === 'select') {
        const queryParams = new URLSearchParams();
        if (params && params !== '*') {
          queryParams.append('select', params);
        } else {
          queryParams.append('select', '*');
        }
        url += '?' + queryParams.toString();
      } else {
        // For insert, update, delete
        method = operation.toUpperCase();
        body = JSON.stringify(params);
      }

      const response = await fetch(url, {
        method,
        headers,
        body
      });

      if (!response.ok) {
        const error = await response.text();
        return { data: null, error: new Error(error) };
      }

      const data = await response.json();
      return { data, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }
}

// Create and export the supabase instance
export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
