// Fixed Supabase client configuration
const SUPABASE_URL = 'https://ufrrlfcxuovxgizxuowh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcnJsZmN4dW92eGdpenh1b3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Mzc2NDgsImV4cCI6MjA2OTIxMzY0OH0.MfwxLihZ6htvufjYv3RLfKwKsazjD_TnVEcV1IDZeQg';

class SupabaseClient {
  private url: string;
  private anonKey: string;

  constructor(url: string, anonKey: string) {
    this.url = url;
    this.anonKey = anonKey;
  }

  // Simple query builder for basic operations
  from(table: string) {
    return {
      select: (columns: string | '*' = '*') => this.createQuery(table, 'select', columns),
      insert: (data: any) => this.createQuery(table, 'insert', data),
      update: (data: any) => this.createQuery(table, 'update', data),
      delete: () => this.createQuery(table, 'delete'),
    };
  }

  rpc(functionName: string, params?: any) {
    return this.createRpcCall(functionName, params);
  }

  private async createQuery(table: string, operation: string, columns: any, options: any = {}) {
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

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (columns !== '*' && typeof columns === 'string') {
        queryParams.append('select', columns);
      } else {
        queryParams.append('select', '*');
      }

      // Apply options
      if (options.group) {
        queryParams.append('group_by', options.group);
      }
      if (options.order) {
        const order = options.ascending === false ? 'desc' : 'asc';
        queryParams.append('order', `${options.order}.${order}`);
      }
      if (options.limit) {
        queryParams.append('limit', options.limit.toString());
      }
      if (options.gte) {
        queryParams.append(options.gte.column, `gte.${options.gte.value}`);
      }

      // Add query params to URL
      if (queryParams.toString()) {
        url += '?' + queryParams.toString();
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

  private async createRpcCall(functionName: string, params?: any) {
    try {
      const headers = {
        'Authorization': `Bearer ${this.anonKey}`,
        'apikey': this.anonKey,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${this.url}/rpc/${functionName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params || {})
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

// Create a singleton instance
export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
