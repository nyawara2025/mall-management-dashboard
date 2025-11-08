// Simplified Supabase client configuration
const SUPABASE_URL = 'https://ufrrlfcxuovxgizxuowh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcnJsZmN4dW92eGdpenh1b3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Mzc2NDgsImV4cCI6MjA2OTIxMzY0OH0.MfwxLihZ6htvufjYv3RLfKwKsazjD_TnVEcV1IDZeQg';

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

interface SupabaseResponse<T = any> {
  data: T | null;
  error: SupabaseError | null;
}

class QueryBuilder {
  private table: string;
  private operation: 'select' | 'insert' | 'update' | 'delete';
  private columns: string = '*';
  private data: any = null;
  private filters: any[] = [];
  private orderOptions: any = null;
  private limitCount: number | null = null;

  constructor(table: string, operation: 'select' | 'insert' | 'update' | 'delete', data?: any) {
    this.table = table;
    this.operation = operation;
    this.data = data;
  }

  select(columns: string = '*'): QueryBuilder {
    this.columns = columns;
    return this;
  }

  eq(column: string, value: any): QueryBuilder {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  or(filters: string): QueryBuilder {
    this.filters.push({ type: 'or', expression: filters });
    return this;
  }

  neq(column: string, value: any): QueryBuilder {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  gte(column: string, value: any): QueryBuilder {
    this.filters.push({ type: 'gte', column, value });
    return this;
  }

  lte(column: string, value: any): QueryBuilder {
    this.filters.push({ type: 'lte', column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): QueryBuilder {
    this.orderOptions = { column, ascending: options?.ascending !== false };
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

  insert(data: any): QueryBuilder {
    this.data = data;
    return this;
  }

  update(data: any): QueryBuilder {
    this.data = data;
    return this;
  }

  async execute(): Promise<SupabaseResponse> {
    try {
      const headers = {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };

      let url = `${SUPABASE_URL}/rest/v1/${this.table}`;
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
          case 'gte':
            queryParams.append(filter.column, `gte.${filter.value}`);
            break;
          case 'lte':
            queryParams.append(filter.column, `lte.${filter.value}`);
            break;
          case 'or':
            queryParams.append('or', filter.expression);
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
              if (filter.type === 'eq') {
                filterParams.append(filter.column, `eq.${filter.value}`);
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
              if (filter.type === 'eq') {
                filterParams.append(filter.column, `eq.${filter.value}`);
              } else if (filter.type === 'or') {
                filterParams.append('or', filter.expression);
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
        return {
          data: null,
          error: {
            message: `HTTP ${response.status}: ${errorText}`,
            code: response.status.toString()
          }
        };
      }

      const data = await response.json();
      return { data, error: null };

    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'FETCH_ERROR'
        }
      };
    }
  }

  then(onfulfilled: (value: SupabaseResponse) => any, onrejected?: (reason: any) => any): Promise<any> {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch(onrejected: (reason: any) => any): Promise<any> {
    return this.execute().catch(onrejected);
  }
}

// Simplified supabase client
const supabase = {
  from(table: string) {
    return {
      select: (columns: string = '*') => new QueryBuilder(table, 'select').select(columns),
      insert: (data: any) => new QueryBuilder(table, 'insert').insert(data),
      update: (data: any) => new QueryBuilder(table, 'update').update(data),
      delete: () => new QueryBuilder(table, 'delete')
    };
  }
};

// Export the client
export { supabase };
export { QueryBuilder };

// Make supabase available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}
