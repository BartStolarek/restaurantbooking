'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Table {
  id: string
  tableNumber: number
  capacity: number
  location: string
  status: string
}

export default function TablesManagementPage() {
  const router = useRouter()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    location: '',
  })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables')
      const data = await response.json()

      if (response.ok) {
        setTables(data.tables)
      } else {
        toast.error('Failed to load tables')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingTable ? `/api/tables/${editingTable.id}` : '/api/tables'
    const method = editingTable ? 'PATCH' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: parseInt(formData.tableNumber),
          capacity: parseInt(formData.capacity),
          location: formData.location || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(
          editingTable ? 'Table updated successfully' : 'Table created successfully'
        )
        setFormData({ tableNumber: '', capacity: '', location: '' })
        setShowAddForm(false)
        setEditingTable(null)
        fetchTables()
      } else {
        toast.error(data.error || 'Operation failed')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleEdit = (table: Table) => {
    setEditingTable(table)
    setFormData({
      tableNumber: table.tableNumber.toString(),
      capacity: table.capacity.toString(),
      location: table.location || '',
    })
    setShowAddForm(true)
  }

  const handleDelete = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) {
      return
    }

    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Table deleted successfully')
        fetchTables()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete table')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleCancelForm = () => {
    setShowAddForm(false)
    setEditingTable(null)
    setFormData({ tableNumber: '', capacity: '', location: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-purple-600">Manager Portal</h1>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => router.push('/manager/dashboard')}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => router.push('/manager/bookings')}>
                Bookings
              </Button>
              <Button variant="ghost" onClick={() => router.push('/manager/analytics')}>
                Analytics
              </Button>
              <Button variant="ghost" onClick={() => router.push('/')}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Table Management</h2>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>Add New Table</Button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingTable ? 'Edit Table' : 'Add New Table'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Table Number"
                  type="number"
                  value={formData.tableNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, tableNumber: e.target.value })
                  }
                  required
                />
                <Input
                  label="Capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  min="1"
                  max="20"
                  required
                />
                <Input
                  label="Location (optional)"
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Window, Patio"
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit">
                  {editingTable ? 'Update Table' : 'Create Table'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancelForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tables List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {tables.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No tables yet</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Table #{table.tableNumber}
                      </h3>
                      <p className="text-gray-600">Capacity: {table.capacity}</p>
                      {table.location && (
                        <p className="text-sm text-gray-500">{table.location}</p>
                      )}
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        table.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : table.status === 'OCCUPIED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {table.status}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(table)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(table.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

