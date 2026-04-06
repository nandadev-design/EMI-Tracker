import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL      as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isCloudConfigured = () => Boolean(url && anon && url.startsWith('http'))

let _client: SupabaseClient | null = null
export function getSupabase(): SupabaseClient | null {
  if (!isCloudConfigured()) return null
  if (!_client) _client = createClient(url!, anon!)
  return _client
}
