"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Package,
  CreditCard,
  Banknote,
  Receipt,
} from "lucide-react"
import { useProducts } from "@/lib/hooks/useProducts"
import { useCustomers } from "@/lib/hooks/useCustomers"
import { useSales } from "@/lib/hooks/useSales"

interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
}

interface CartItem {
  product: Product
  quantity: number
}

interface Customer {
  id: string
  name: string
}

export default function POSContent() {
  const { products, loading: productsLoading } = useProducts()
  const { customers } = useCustomers()
  const { createSale, refetch: refetchSales } = useSales()

  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [lastSale, setLastSale] = useState<{
    items: CartItem[]
    total: number
    customer: Customer | null
    paymentMethod: string
  } | null>(null)
  const { toast } = useToast()

  const categories = ["all", "Electronics", "Accessories", "Clothing", "Food", "Home", "Other"]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory && product.stock > 0
  })

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({
            title: "Stock limit",
            description: `Only ${product.stock} items available.`,
            variant: "destructive",
          })
          return prev
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta
            if (newQuantity <= 0) return null
            if (newQuantity > item.product.stock) {
              toast({
                title: "Stock limit",
                description: `Only ${item.product.stock} items available.`,
                variant: "destructive",
              })
              return { ...item, quantity: item.product.stock }
            }
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const total = subtotal

  const handlePayment = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to the cart.",
        variant: "destructive",
      })
      return
    }

    setIsPaymentOpen(true)
  }

  const completePayment = async () => {
    try {
      // Create sale items
      const saleItems = cart.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }))

      // Create the sale
      await createSale(
        {
          customer_id: selectedCustomer?.id || null,
          customer_name: selectedCustomer?.name || "Walk-in Customer",
          subtotal,
          total,
          payment_method: paymentMethod,
          status: "completed",
        },
        saleItems
      )

      setLastSale({
        items: [...cart],
        total,
        customer: selectedCustomer,
        paymentMethod,
      })

      toast({
        title: "Payment successful",
        description: `Total: $${total.toFixed(2)} paid with ${paymentMethod}.`,
      })

      setIsPaymentOpen(false)
      setIsReceiptOpen(true)
      clearCart()
      refetchSales()
    } catch (error) {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      })
    }
  }

  if (productsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
            <p className="text-gray-500 mt-1">Process sales and manage transactions</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 bg-white rounded-xl border animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-gray-500 mt-1">Process sales and manage transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={clearCart} disabled={cart.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
          <Button onClick={handlePayment} disabled={cart.length === 0}>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${total.toFixed(2)}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.product.id === product.id)
              const inCart = cartItem?.quantity || 0
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="p-4 bg-white rounded-xl border text-left hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                    <Package className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    {inCart > 0 && (
                      <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                        {inCart} in cart
                      </span>
                    )}
                  </div>
                  {product.stock <= 10 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Only {product.stock} left
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cart Panel */}
        <div className="bg-white rounded-xl shadow-sm border flex flex-col h-[700px]">
          {/* Customer Selection */}
          <div className="p-4 border-b">
            <Label>Customer (Optional)</Label>
            <Select
              value={selectedCustomer?.id || ""}
              onValueChange={(value) =>
                setSelectedCustomer(customers.find((c) => c.id === value) || null)
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="h-12 w-12 mb-2" />
                <p>Cart is empty</p>
                <p className="text-sm">Add products to get started</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="p-4 border-t bg-gray-50 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-3xl font-bold">${total.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Banknote
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Credit/Debit Card
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <Label>Amount Received</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  defaultValue={total.toFixed(2)}
                />
                <p className="text-sm text-gray-500">
                  Change: $0.00
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={completePayment}>
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Sale Complete
            </DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <p className="text-2xl font-bold text-green-600">
                  ${lastSale.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Paid with {lastSale.paymentMethod}
                </p>
              </div>

              <div className="space-y-2">
                {lastSale.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>
                      {item.product.name} x{item.quantity}
                    </span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    ${(lastSale.total / 1.08).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${lastSale.total.toFixed(2)}</span>
                </div>
              </div>

              {lastSale.customer && (
                <div className="text-sm text-gray-500 border-t pt-4">
                  Customer: {lastSale.customer.name}
                </div>
              )}

              <div className="text-center text-xs text-gray-400">
                <p>Thank you for your purchase!</p>
                <p>{new Date().toLocaleString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiptOpen(false)}>
              Close
            </Button>
            <Button>
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Printer({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
      />
    </svg>
  )
}