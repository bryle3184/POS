"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Search,
  Calendar,
  DollarSign,
  ShoppingBag,
  User,
  Download,
  Eye,
  Printer,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react"
import { useSales } from "@/lib/hooks/useSales"
import { format } from "date-fns"

interface SaleItem {
  id: string
  product_name: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Sale {
  id: string
  customer_name: string | null
  customer_id: string | null
  subtotal: number
  total: number
  payment_method: string
  status: string
  created_at: string
}

export default function SalesHistoryContent() {
  const { sales, loading, getSaleItems, deleteSale } = useSales()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Sale | null>(null)
  const { toast } = useToast()
  const itemsPerPage = 10

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && format(new Date(sale.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) ||
      (dateFilter === "week" && new Date(sale.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "month" && new Date(sale.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    return matchesSearch && matchesStatus && matchesDate
  })

  const totalRevenue = filteredSales
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + Number(s.total), 0)

  const totalRefunded = filteredSales
    .filter((s) => s.status === "refunded")
    .reduce((sum, s) => sum + Number(s.total), 0)

  const totalSales = filteredSales.filter((s) => s.status === "completed").length

  const viewDetails = async (sale: Sale) => {
    setSelectedSale(sale)
    setIsLoadingDetails(true)
    setIsDetailOpen(true)
    try {
      const items = await getSaleItems(sale.id)
      setSaleItems(items)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sale details",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handlePrint = (sale: Sale) => {
    toast({
      title: "Printing receipt",
      description: `Receipt for sale ${sale.id.slice(0, 8)}... is being printed.`,
    })
  }

  const handleDelete = async () => {
    if (!saleToDelete) return
    try {
      await deleteSale(saleToDelete.id)
      toast({
        title: "Sale deleted",
        description: `Sale ${saleToDelete.id.slice(0, 8)}... has been removed.`,
      })
      setIsDeleteOpen(false)
      setSaleToDelete(null)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete sale",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    toast({
      title: "Export started",
      description: "Sales data export has been queued.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "refunded":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
            <p className="text-gray-500 mt-1">View and manage all transactions</p>
          </div>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-500 mt-1">View and manage all transactions</p>
        </div>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold mt-1">{totalSales}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Refunded</p>
              <p className="text-2xl font-bold mt-1 text-red-600">${totalRefunded.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Receipt className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by invoice ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm">{sale.id.slice(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{sale.customer_name || "Walk-in"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">${Number(sale.total).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm capitalize">{sale.payment_method}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{format(new Date(sale.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.status)}`}
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewDetails(sale)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePrint(sale)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { 
                          setSaleToDelete(sale); setIsDeleteOpen(true)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No sales found.</p>
        </div>
      )}

      {/* Pagination */}
      {filteredSales.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredSales.length} of {filteredSales.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Page {currentPage}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage * itemsPerPage >= filteredSales.length}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Sale Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sale Details - {selectedSale?.id.slice(0, 8)}...</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6">
              {isLoadingDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading sale details...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">{format(new Date(selectedSale.created_at), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedSale.status)}`}
                      >
                        {selectedSale.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{selectedSale.customer_name || "Walk-in Customer"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium capitalize">{selectedSale.payment_method}</p>
                    </div>
                  </div>

                  {saleItems.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3">Items</h3>
                      <table className="w-full">
                        <thead>
                          <tr className="text-sm text-gray-500">
                            <th className="text-left pb-2">Product</th>
                            <th className="text-center pb-2">Qty</th>
                            <th className="text-right pb-2">Price</th>
                            <th className="text-right pb-2">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {saleItems.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2">
                                <div>
                                  <p className="font-medium">{item.product_name}</p>
                                  <p className="text-xs text-gray-500">{item.sku}</p>
                                </div>
                              </td>
                              <td className="py-2 text-center">{item.quantity}</td>
                              <td className="py-2 text-right">${Number(item.unit_price).toFixed(2)}</td>
                              <td className="py-2 text-right">${Number(item.total_price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${Number(selectedSale.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${Number(selectedSale.total).toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete {selectedProduct?.id}? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}