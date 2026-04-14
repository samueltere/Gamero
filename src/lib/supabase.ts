import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'supabase-anon-key-placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface DataErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function isSupabaseConfigured() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function handleDataError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  options?: { throwError?: boolean },
) {
  const errInfo: DataErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };

  console.error('Supabase Error: ', JSON.stringify(errInfo));

  if (options?.throwError !== false) {
    throw new Error(JSON.stringify(errInfo));
  }

  return errInfo;
}
