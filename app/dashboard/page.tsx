"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DashboardContent from "@/components/dashboard-content"
import CustomersContent from "@/components/customers-content"
import ProductsContent from "@/components/products-content"
import POSContent from "@/components/pos-content"
import SalesHistoryContent from "@/components/sales-history-content"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    const tab = searchParams.get("tab") || "dashboard"
    setActiveTab(tab)
  }, [searchParams])

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />
      case "customers":
        return <CustomersContent />
      case "products":
        return <ProductsContent />
      case "pos":
        return <POSContent />
      case "history":
        return <SalesHistoryContent />
      default:
        return <DashboardContent />
    }
  }

  return <DashboardLayout activeTab={activeTab}>{renderContent()}</DashboardLayout>
}