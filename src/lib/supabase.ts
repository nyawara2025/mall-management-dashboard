// Supabase client configuration
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
      select: (columns: string | '*' = '*', options?: { count?: string }) => ({
        group: (column: string) => this.createQuery(table, 'select', columns, { group: column }),
        order: (column: string, orderOptions?: { ascending?: boolean }) => 
          this.createQuery(table, 'select', columns, { order: column, ...orderOptions }),
        limit: (count: number) => this.createQuery(table, 'select', columns, { limit: count }),
        gte: (column: string, value: string) => this.createQuery(table, 'select', columns, { gte: { column, value } }),
        eq: (column: string, value: string) => this.createQuery(table, 'select', columns, { eq: { column, value } }),
        neq: (column: string, value: string) => this.createQuery(table, 'select', columns, { neq: { column, value } }),
      }),
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
      }

      // Handle different operations
      switch (operation) {
        case 'select':
          // Handle grouping
          if (options.group) {
            queryParams.append('select', `${options.group},count(*)`);
            queryParams.append('group_by', options.group);
          }
          
          // Handle ordering
          if (options.order) {
            const orderDirection = options.ascending === false ? 'desc' : 'asc';
            queryParams.append('order', `${options.order}.${orderDirection}`);
          }
          
          // Handle limits
          if (options.limit) {
            queryParams.append('limit', options.limit.toString());
          }
          
          // Handle gte filters
          if (options.gte) {
            queryParams.append('gte', `${options.gte.column},${options.gte.value}`);
          }
          
          // Handle eq filters (column=eq.value)
          if (options.eq) {
            queryParams.append(`${options.eq.column}`, `eq.${options.eq.value}`);
          }
          
          // Handle neq filters (column=neq.value) 
          if (options.neq) {
            queryParams.append(`${options.neq.column}`, `neq.${options.neq.value}`);
          }
          
          url += `?${queryParams.toString()}`;
          method = 'GET';
          break;
          
        case 'insert':
          method = 'POST';
          body = columns;
          break;
          
        case 'update':
          method = 'PATCH';
          body = columns;
          break;
          
        case 'delete':
          method = 'DELETE';
          break;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Handle count responses
      if (Array.isArray(data) && data.length > 0 && data[0].count !== undefined) {
        return { data, error: null, count: data[0].count };
      }

      return { data, error: null };

    } catch (error) {
      console.error('Supabase query error:', error);
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

      const response = await fetch(`${this.url}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params || {})
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`RPC error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return { data, error: null };

    } catch (error) {
      console.error('RPC call error:', error);
      return { data: null, error };
    }
  }
}

// Create and export the client instance
export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export the class for testing or custom usage
export { SupabaseClient };

// Make supabase available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}
