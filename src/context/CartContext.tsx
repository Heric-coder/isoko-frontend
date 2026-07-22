import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { cartApi } from '@/api/cart'
import { tokenStore } from '@/api/client'
import type { Cart } from '@/types'

interface CartContextValue {
  cart: Cart | null
  itemCount: number
  isLoading: boolean
  refreshCart: () => Promise<void>
  addItem: (product: string, quantity?: number, variant?: string) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setCart(null)
      return
    }
    setIsLoading(true)
    try {
      const data = await cartApi.get()
      setCart(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addItem = async (product: string, quantity = 1, variant?: string) => {
    const data = await cartApi.addItem(product, quantity, variant)
    setCart(data)
  }

  const updateItem = async (itemId: string, quantity: number) => {
    const data = await cartApi.updateItem(itemId, quantity)
    setCart(data)
  }

  const removeItem = async (itemId: string) => {
    await cartApi.removeItem(itemId)
    await refreshCart()
  }

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, itemCount, isLoading, refreshCart, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
