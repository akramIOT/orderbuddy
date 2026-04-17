import { useCallback } from 'react'

const SESSION_KEY = 'ob-session'

export interface OrderBuddySession {
  restaurantId: string
  locationId: string
  originId: string
  menuId: string
  cart: any[]
  timestamp: number
}

export function useSessionStorage() {
  const saveSession = useCallback((session: Omit<OrderBuddySession, 'timestamp'>) => {
    const fullSession: OrderBuddySession = {
      ...session,
      timestamp: Date.now(),
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(fullSession))
  }, [])

  const loadSession = useCallback((): OrderBuddySession | null => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    try {
      const session = JSON.parse(raw)
      return session
    } catch {
      return null
    }
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
  }, [])

  return {
    saveSession,
    loadSession,
    clearSession,
  }
}
