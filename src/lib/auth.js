import { supabase } from './supabase'

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return employee || null
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('signOut error:', error)
}