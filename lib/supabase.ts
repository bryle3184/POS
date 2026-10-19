import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types
export interface Customer {
  id: string
  user_id: string | null
  name: string
  email: string
  phone: string
  address: string
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  cost: number
  stock: number
  min_stock: number
  description: string
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  user_id: string | null
  customer_id: string | null
  customer_name: string
  subtotal: number
  total: number
  payment_method: string
  status: string
  created_at: string
}

export interface SaleItem {
  id: string
  user_id: string | null
  sale_id: string
  product_id: string
  product_name: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

// Helper to get the current authenticated user's ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// Customer services (user-owned data)
export const customerService = {
  async getAll() {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Authentication required')

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Customer[]
  },

  async create(customer: Omit<Customer, 'id' | 'total_orders' | 'total_spent' | 'created_at' | 'updated_at'>) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Authentication required')

    const { data, error } = await supabase
      .from('customers')
      .insert([{ ...customer, total_orders: 0, total_spent: 0, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data as Customer
  },

  async update(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Customer
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Product services (shared inventory — not user-owned)
export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Product[]
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  async update(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async updateStock(id: string, quantity: number) {
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const { data, error } = await supabase
      .from('products')
      .update({
        stock: product.stock - quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Product
  }
}

// Sales services (user-owned data)
export const salesService = {
  async getAll(limit = 50) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Authentication required')

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as Sale[]
  },

  async create(sale: Omit<Sale, 'id' | 'created_at'>, items: Omit<SaleItem, 'id' | 'sale_id' | 'created_at'>[]) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Authentication required')

    // Create sale with user_id
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ ...sale, user_id: userId }])
      .select()
      .single()

    if (saleError) throw saleError

    // Create sale items with user_id
    const saleItems = items.map(item => ({
      ...item,
      sale_id: saleData.id,
      user_id: userId,
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) throw itemsError

    // Update product stock
    for (const item of items) {
      await productService.updateStock(item.product_id, item.quantity)
    }

    // Update customer stats if applicable
    if (sale.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('total_orders, total_spent')
        .eq('id', sale.customer_id)
        .single()

      if (customer) {
        await supabase
          .from('customers')
          .update({
            total_orders: customer.total_orders + 1,
            total_spent: customer.total_spent + sale.total,
            updated_at: new Date().toISOString()
          })
          .eq('id', sale.customer_id)
      }
    }

    return saleData as Sale
  },

  async getItems(saleId: string) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Authentication required')

    const { data, error } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId)
      .eq('user_id', userId)

    if (error) throw error
    return data as SaleItem[]
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Dashboard statistics (user-scoped)
export const dashboardService = {
  async getStats() {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Authentication required')

    const [salesResult, productsResult, customersResult] = await Promise.all([
      supabase.from('sales').select('total').eq('user_id', userId),
      supabase.from('products').select('id'),
      supabase.from('customers').select('id').eq('user_id', userId)
    ])

    // Handle individual query errors gracefully
    const salesError = salesResult.error
    const productsError = productsResult.error
    const customersError = customersResult.error

    if (salesError && salesError.code !== 'PGRST116') console.error('Sales stats error:', salesError)
    if (productsError && productsError.code !== 'PGRST116') console.error('Products stats error:', productsError)
    if (customersError && customersError.code !== 'PGRST116') console.error('Customers stats error:', customersError)

    const totalRevenue = salesResult.data?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0
    const totalOrders = salesResult.data?.length || 0
    const totalCustomers = customersResult.data?.length || 0
    const totalProducts = productsResult.data?.length || 0

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts
    }
  },

  async getRecentSales(limit = 10) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Authentication required')

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as Sale[]
  },

  async getTopProducts(limit = 5) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Authentication required')

    const { data, error } = await supabase
      .from('sale_items')
      .select('product_name, quantity, total_price')
      .eq('user_id', userId)
      .order('quantity', { ascending: false })
      .limit(limit * 10)

    if (error) throw error

    // Aggregate by product
    const productMap = new Map<string, { sales: number, revenue: number }>()
    data?.forEach((item: any) => {
      const existing = productMap.get(item.product_name) || { sales: 0, revenue: 0 }
      productMap.set(item.product_name, {
        sales: existing.sales + item.quantity,
        revenue: existing.revenue + Number(item.total_price)
      })
    })

    return Array.from(productMap.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit)
  },

  async getLowStockProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('stock', { ascending: true })

    if (error) throw error

    return (data as Product[]).filter(p => p.stock <= p.min_stock)
  }
}
