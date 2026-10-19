import { useState, useEffect } from 'react'
import { Customer, customerService } from '@/lib/supabase'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await customerService.getAll()
      setCustomers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const addCustomer = async (customer: Omit<Customer, 'id' | 'user_id' | 'total_orders' | 'total_spent' | 'created_at' | 'updated_at'>) => {
    try {
      const newCustomer = await customerService.create(customer)
      setCustomers([newCustomer, ...customers])
      return newCustomer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer')
      throw err
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const updated = await customerService.update(id, updates)
      setCustomers(customers.map(c => c.id === id ? updated : c))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer')
      throw err
    }
  }

  const deleteCustomer = async (id: string) => {
    try {
      await customerService.delete(id)
      setCustomers(customers.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer')
      throw err
    }
  }

  return { customers, loading, error, addCustomer, updateCustomer, deleteCustomer, refetch: fetchCustomers }
}