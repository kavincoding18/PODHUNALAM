import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'podhunalam_supabase_url';
const STORAGE_KEY_KEY = 'podhunalam_supabase_anon_key';

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  const url = storedUrl || envUrl || '';
  const anonKey = storedKey || envKey || '';

  const isConfigured = Boolean(
    url && 
    anonKey && 
    url.startsWith('https://') && 
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export interface ConnectionStatus {
  connected: boolean;
  message: string;
  tablesFound?: string[];
  missingTables?: string[];
  latencyMs?: number;
}

export async function testSupabaseConnection(): Promise<ConnectionStatus> {
  const client = getSupabase();
  if (!client) {
    return {
      connected: false,
      message: 'Supabase credentials not configured. Please supply your Supabase Project URL and Anon Public Key.'
    };
  }

  const startTime = Date.now();
  const requiredTables = ['departments', 'grievances', 'profiles', 'administrative_units'];
  const tablesFound: string[] = [];
  const missingTables: string[] = [];

  try {
    for (const table of requiredTables) {
      const { error } = await client.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        missingTables.push(table);
      } else {
        tablesFound.push(table);
      }
    }

    const latencyMs = Date.now() - startTime;
    if (tablesFound.length > 0) {
      return {
        connected: true,
        message: `Successfully connected to Supabase in ${latencyMs}ms. Detected ${tablesFound.length}/${requiredTables.length} required tables.`,
        tablesFound,
        missingTables,
        latencyMs
      };
    } else {
      return {
        connected: false,
        message: `Connected to Supabase endpoint, but required database tables have not been created yet. Please execute the SQL migration script in your Supabase SQL Editor.`,
        tablesFound: [],
        missingTables: requiredTables,
        latencyMs
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${errorMsg}`
    };
  }
}
