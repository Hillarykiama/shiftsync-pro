import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function useIsManager() {
  const { currentEmployee } = useAuth()
  return currentEmployee?.role_type === 'manager'
}