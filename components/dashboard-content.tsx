"use client"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, ShoppingBag, Users2, Package, AlertCircle } from "lucide-react"
import { useDashboard } from "@/lib/hooks/useDashboard"
import { formatDistanceToNow } from "date-fns"

const stats = [
  { name: "Total Revenue", key: "totalRevenue", icon: DollarSign },
  { name: "Total Orders", key: "totalOrders", icon: ShoppingBag },
  { name: "Total Customers", key: "totalCustomers", icon: Users2 },
  { name: "Total Products", key: "totalProducts", icon: Package },
]

export default function DashboardContent() {
  const { stats: dashboardStats, recentSales, topProducts, lowStockProducts, loading } = useDashboard()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const formattedStats = stats.map(stat => {
    const key = stat.key as keyof typeof dashboardStats
    return {
      ...stat,
      value: stat.key === "totalRevenue"
        ? `$${dashboardStats[key].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : dashboardStats[key].toLocaleString(),
      change: "+0.0%",
      positive: true
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {formattedStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    stat.positive ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      stat.positive ? "text-green-600" : "text-red-600"
                    }`}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span
                  className={`font-medium ${
                    stat.positive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Recent Sales</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sale.customer_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${sale.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sale.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : sale.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(sale.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Top Products</h2>
          </div>
          <div className="p-6 space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${product.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-lg border border-yellow-200 bg-yellow-50"
              >
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Stock level</span>
                  <span
                    className={`text-sm font-medium ${
                      product.stock <= product.min_stock / 2
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {product.stock} / {product.min_stock}
                  </span>
                </div>
                <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      product.stock <= product.min_stock / 2 ? "bg-red-500" : "bg-yellow-500"
                    }`}
                    style={{ width: `${(product.stock / product.min_stock) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}