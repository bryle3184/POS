import { useState, useEffect } from 'react'
import { Product, productService } from '@/lib/supabase'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getAll()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProduct = await productService.create(product)
      setProducts([newProduct, ...products])
      return newProduct
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product')
      throw err
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updated = await productService.update(id, updates)
      setProducts(products.map(p => p.id === id ? updated : p))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
      throw err
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id)
      setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      throw err
    }
  }

  return { products, loading, error, addProduct, updateProduct, deleteProduct, refetch: fetchProducts }
}