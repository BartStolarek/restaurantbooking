'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
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
  table: {
    id: string
    tableNumber: number
    capacity: number
    location: string
    status: string
  }
  user: {
    name: string
    email: string
    phone: string
  }
}

export default function StaffDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [bookingsRes, tablesRes] = await Promise.all([
        fetch('/api/staff/bookings'),
        fetch('/api/tables'),
      ])

      const bookingsData = await bookingsRes.json()
      const tablesData = await tablesRes.json()

      if (bookingsRes.ok) setBookings(bookingsData.bookings)
      if (tablesRes.ok) setTables(tablesData.tables)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: string,
    additionalData: any = {}
  ) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData }),
      })

      if (response.ok) {
        toast.success('Booking updated successfully')
        fetchData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update booking')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleSeatCustomer = (booking: Booking) => {
    handleUpdateBookingStatus(booking.id, 'SEATED', {
      actualStartTime: new Date().toISOString(),
    })
  }

  const handleCompleteBooking = (booking: Booking) => {
    handleUpdateBookingStatus(booking.id, 'COMPLETED', {
      actualEndTime: new Date().toISOString(),
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'SEATED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500'
      case 'OCCUPIED':
        return 'bg-red-500'
      case 'RESERVED':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600">Staff Dashboard</h1>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/staff/walk-in')}>
                Walk-In Customer
              </Button>
              <Button variant="ghost" onClick={() => router.push('/')}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Table Status Grid */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Table Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className="border rounded-lg p-4 text-center relative"
              >
                <div
                  className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getTableStatusColor(
                    table.status
                  )}`}
                ></div>
                <p className="text-2xl font-bold text-gray-900">
                  {table.tableNumber}
                </p>
                <p className="text-sm text-gray-600">Cap: {table.capacity}</p>
                {table.location && (
                  <p className="text-xs text-gray-500 mt-1">{table.location}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Reserved</span>
            </div>
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Today's Bookings
          </h2>

          {bookings.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No bookings for today
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold">
                          {format(new Date(booking.bookingTime), 'h:mm a')}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          Table #{booking.table.tableNumber}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">{booking.user.name}</p>
                        <p>
                          Party of {booking.partySize} • {booking.user.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          onClick={() => handleSeatCustomer(booking)}
                        >
                          Seat Customer
                        </Button>
                      )}
                      {booking.status === 'SEATED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCompleteBooking(booking)}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
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

