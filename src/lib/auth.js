import { supabase } from './supabase'

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('Auth user:', user, 'Error:', error)
    if (error || !user) return null

    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('Employee query result:', employee, 'Error:', empError)

    if (empError) {
      console.error('Employee fetch error:', empError)
      return null
    }

    return employee || null
  } catch (err) {
    console.error('getCurrentUser error:', err)
    return null
  }
}

export async function signOut() {
  try {
    await supabase.auth.signOut()
    window.location.href = '/'
  } catch (err) {
    console.error('signOut error:', err)
    window.location.href = '/'
  }
}
