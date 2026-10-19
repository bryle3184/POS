import { useState, useEffect } from 'react'
import { Sale, SaleItem, salesService } from '@/lib/supabase'

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = async (limit = 50) => {
    try {
      setLoading(true)
      const data = await salesService.getAll(limit)
      setSales(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales')
      console.error('Error fetching sales:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [])

  const createSale = async (sale: Omit<Sale, 'id' | 'user_id' | 'created_at'>, items: Omit<SaleItem, 'id' | 'user_id' | 'sale_id' | 'created_at'>[]) => {
    try {
      const newSale = await salesService.create(sale, items)
      setSales([newSale, ...sales])
      return newSale
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sale')
      throw err
    }
  }

  const getSaleItems = async (saleId: string) => {
    try {
      return await salesService.getItems(saleId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sale items')
      throw err
    }
  }

  const deleteSale = async (id: string) => {
    try {
      await salesService.delete(id)
      setSales(sales.filter(s => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sale')
      throw err
    }
  }

  return { sales, loading, error, createSale, getSaleItems, deleteSale, refetch: fetchSales }
}