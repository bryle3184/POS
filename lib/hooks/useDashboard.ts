import { useState, useEffect } from 'react'
import { dashboardService, Product, Sale } from '@/lib/supabase'

export function useDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0
  })
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [topProducts, setTopProducts] = useState<{ name: string, sales: number, revenue: number }[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, salesData, productsData, lowStockData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentSales(),
        dashboardService.getTopProducts(),
        dashboardService.getLowStockProducts()
      ])

      setStats(statsData)
      setRecentSales(salesData)
      setTopProducts(productsData)
      setLowStockProducts(lowStockData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    stats,
    recentSales,
    topProducts,
    lowStockProducts,
    loading,
    error,
    refetch: fetchDashboardData
  }
}