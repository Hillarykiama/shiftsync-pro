import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('URL:', supabaseUrl)
console.log('KEY:', supabaseAnonKey ? 'exists' : 'missing')

// Custom storage adapter that avoids lock issues
class LocalStorageAdapter {
  async getItem(key) {
    return localStorage.getItem(key)
  }
  
  async setItem(key, value) {
    localStorage.setItem(key, value)
  }
  
  async removeItem(key) {
    localStorage.removeItem(key)
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new LocalStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'implicit'
  }
})

console.log('Supabase client initialized with custom storage')