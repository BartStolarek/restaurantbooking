'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  partySize: number
  bookingType: string
  status: string
  bookingTime: string
  estimatedDuration: number
  actualStartTime: string | null
  actualEndTime: string | null
  table: {
    tableNumber: number
    capacity: number
    location: string
  }
  user: {
    name: string
    email: string
    phone: string
  }
}

export default function ManagerBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    try {
      const url =
        statusFilter === 'all'
          ? '/api/manager/bookings'
          : `/api/manager/bookings?status=${statusFilter}`

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setBookings(data.bookings)
      } else {
        toast.error('Failed to load bookings')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'SEATED':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'SEATED', label: 'Seated' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

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
              <Button variant="ghost" onClick={() => router.push('/manager/tables')}>
                Tables
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-gray-900">All Bookings</h2>
          <div className="w-full md:w-64">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {bookings.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No bookings found</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">
                        {format(new Date(booking.bookingTime), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm">
                        {format(new Date(booking.bookingTime), 'h:mm a')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{booking.user.name}</p>
                      <p className="text-sm text-gray-600">{booking.user.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Details</p>
                      <p className="font-medium">
                        Party of {booking.partySize} • Table #{booking.table.tableNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.bookingType} • {booking.estimatedDuration} min
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {booking.actualStartTime && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                      <span>
                        Started: {format(new Date(booking.actualStartTime), 'h:mm a')}
                      </span>
                      {booking.actualEndTime && (
                        <span className="ml-4">
                          Ended: {format(new Date(booking.actualEndTime), 'h:mm a')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

