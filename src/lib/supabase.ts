// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ufrrlfcxuovxgizxuowh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcnJsZmN4dW92eGdpenh1b3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Mzc2NDgsImV4cCI6MjA2OTIxMzY0OH0.MfwxLihZ6htvufjYv3RLfKwKsazjD_TnVEcV1IDZeQg';

// Type alias for the Supabase client
type SupabaseClient = ReturnType<typeof createClient>;

class QueryBuilder {
  private supabase: SupabaseClient;
  private table: string;
  private operation: 'select' | 'insert' | 'update' | 'delete';
  private columns: string = '*';
  private data: any = null;
  private filters: any[] = [];
  private orderOptions: any = null;
  private limitCount: number | null = null;
  private groupOptions: any = null;

  constructor(supabase: SupabaseClient, table: string, operation: 'select' | 'insert' | 'update' | 'delete', data?: any) {
    this.supabase = supabase;
    this.table = table;
    this.operation = operation;
    this.data = data;
  }

  select(columns: string = '*', options?: { count?: string }): QueryBuilder {
    this.columns = columns;
    if (options?.count) {
      this.groupOptions = { count: options.count };
    }
    return this;
  }

  insert(data: any): QueryBuilder {
    this.data = data;
    return this;
  }

  update(data: any): QueryBuilder {
    this.data = data;
    return this;
  }

  delete(): QueryBuilder {
    return this;
  }

  eq(column: string, value: any): QueryBuilder {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column: string, value: any): QueryBuilder {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  gt(column: string, value: any): QueryBuilder {
    this.filters.push({ type: 'gt', column, value });
    return this;
  }

  gte(column: string, value: any): QueryBuilder {
    this.filters.push({ type: 'gte', column, value });
    return this;
  }

  lt(column: string, value: any): QueryBuilder {
    this.filters.push({ type: 'lt', column, value });
    return this;
  }

  lte(column: string, value: any): QueryBuilder {
    this.filters.push({ type: 'lte', column, value });
    return this;
  }

  or(expression: string): QueryBuilder {
    this.filters.push({ type: 'or', expression });
    return this;
  }

  like(column: string, pattern: string): QueryBuilder {
    this.filters.push({ type: 'like', column, pattern });
    return this;
  }

  ilike(column: string, pattern: string): QueryBuilder {
    this.filters.push({ type: 'ilike', column, pattern });
    return this;
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): QueryBuilder {
    this.orderOptions = { column, ...options };
    return this;
  }

  limit(count: number): QueryBuilder {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number): QueryBuilder {
    this.filters.push({ type: 'range', from, to });
    return this;
  }

  // Make it thenable and awaitable
  then(resolve: any, reject?: any) {
    return this.execute().then(resolve, reject);
  }

  // Make it awaitable by making it behave like a promise
  get [Symbol.toStringTag]() {
    return 'Promise';
  }

  // Execute the query
  async execute() {
    try {
      const headers = {
        'Authorization': `Bearer ${this.supabase.getAnonKey()}`,
        'apikey': this.supabase.getAnonKey(),
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };

      let url = `${this.supabase.getUrl()}/rest/v1/${this.table}`;
      let method = 'GET';
      let body = null;

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (this.columns !== '*' && this.operation === 'select') {
        queryParams.append('select', this.columns);
      }

      // Handle filters
      this.filters.forEach(filter => {
        switch (filter.type) {
          case 'eq':
            queryParams.append(filter.column, `eq.${filter.value}`);
            break;
          case 'neq':
            queryParams.append(filter.column, `neq.${filter.value}`);
            break;
          case 'gt':
            queryParams.append(filter.column, `gt.${filter.value}`);
            break;
          case 'gte':
            queryParams.append(filter.column, `gte.${filter.value}`);
            break;
          case 'lt':
            queryParams.append(filter.column, `lt.${filter.value}`);
            break;
          case 'lte':
            queryParams.append(filter.column, `lte.${filter.value}`);
            break;
          case 'or':
            queryParams.append('or', filter.expression);
            break;
          case 'like':
            queryParams.append(filter.column, `like.${filter.pattern}`);
            break;
          case 'ilike':
            queryParams.append(filter.column, `ilike.${filter.pattern}`);
            break;
          case 'range':
            queryParams.append('offset', filter.from.toString());
            queryParams.append('limit', (filter.to - filter.from + 1).toString());
            break;
        }
      });

      // Handle ordering
      if (this.orderOptions) {
        const direction = this.orderOptions.ascending === false ? 'desc' : 'asc';
        queryParams.append('order', `${this.orderOptions.column}.${direction}`);
      }
      
      // Handle limits
      if (this.limitCount) {
        queryParams.append('limit', this.limitCount.toString());
      }

      // Handle different operations
      switch (this.operation) {
        case 'select':
          url += `?${queryParams.toString()}`;
          method = 'GET';
          break;
          
        case 'insert':
          method = 'POST';
          body = this.data;
          break;
          
        case 'update':
          method = 'PATCH';
          body = this.data;
          if (this.filters.length > 0) {
            // Add filter conditions to URL for updates
            const filterParams = new URLSearchParams();
            this.filters.forEach(filter => {
              switch (filter.type) {
                case 'eq':
                  filterParams.append(filter.column, `eq.${filter.value}`);
                  break;
              }
            });
            if (filterParams.toString()) {
              url += `?${filterParams.toString()}`;
            }
          }
          break;
          
        case 'delete':
          method = 'DELETE';
          if (this.filters.length > 0) {
            // Add filter conditions to URL for deletes
            const filterParams = new URLSearchParams();
            this.filters.forEach(filter => {
              switch (filter.type) {
                case 'eq':
                  filterParams.append(filter.column, `eq.${filter.value}`);
                  break;
                case 'or':
                  filterParams.append('or', filter.expression);
                  break;
              }
            });
            if (filterParams.toString()) {
              url += `?${filterParams.toString()}`;
            }
          }
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
      
      return { data, error: null };

    } catch (error) {
      console.error('Supabase query error:', error);
      return { data: null, error };
    }
  }
}

class SupabaseClient {
  private url: string;
  private anonKey: string;

  constructor(url: string, anonKey: string) {
    this.url = url;
    this.anonKey = anonKey;
  }

  // Public methods to access private properties
  getUrl(): string {
    return this.url;
  }

  getAnonKey(): string {
    return this.anonKey;
  }

  // Query builder from method
  from(table: string) {
    return {
      select: (columns: string = '*', options?: { count?: string } = {}) => 
        new QueryBuilder(this, table, 'select').select(columns, options),
      insert: (data: any) => 
        new QueryBuilder(this, table, 'insert').insert(data),
      update: (data: any) => 
        new QueryBuilder(this, table, 'update').update(data),
      delete: () => 
        new QueryBuilder(this, table, 'delete'),
    };
  }

  rpc(functionName: string, params?: any) {
    return this.createRpcCall(functionName, params);
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
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export the classes for testing or custom usage
export { QueryBuilder };

// Make supabase available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}
