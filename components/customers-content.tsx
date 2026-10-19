"use client"

import { useState } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, User } from "lucide-react"
import { useCustomers } from "@/lib/hooks/useCustomers"
import { format } from "date-fns"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export default function CustomersContent() {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer } = useCustomers()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" })
  const { toast } = useToast()

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))
  )

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomer(customer)
      setFormData({ name: customer.name, email: customer.email, phone: customer.phone || "", address: customer.address || "" })
    } else {
      setSelectedCustomer(null)
      setFormData({ name: "", email: "", phone: "", address: "" })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, formData)
        toast({
          title: "Customer updated",
          description: `${formData.name} has been updated.`,
        })
      } else {
        await addCustomer(formData)
        toast({
          title: "Customer added",
          description: `${formData.name} has been added.`,
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save customer",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedCustomer) return

    try {
      await deleteCustomer(selectedCustomer.id)
      toast({
        title: "Customer deleted",
        description: `${selectedCustomer.name} has been removed.`,
      })
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete customer",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-500 mt-1">Manage your customer database</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-500 mt-1">Manage your customer database</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-500">
                    Customer since {format(new Date(customer.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(customer)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {customer.email}
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {customer.phone}
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {customer.address}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-lg font-semibold">{customer.total_orders}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-lg font-semibold">${customer.total_spent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No customers found.</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedCustomer ? "Save Changes" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.
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