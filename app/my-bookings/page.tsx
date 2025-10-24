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
    tableNumber: number
    capacity: number
    location: string
  }
}

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings/my-bookings')
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      if (response.ok) {
        toast.success('Booking cancelled successfully')
        fetchBookings()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to cancel booking')
      }
    } catch (error) {
      toast.error('An error occurred')
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

  const canCancelBooking = (booking: Booking) => {
    const bookingTime = new Date(booking.bookingTime)
    const now = new Date()
    return (
      bookingTime > now &&
      (booking.status === 'CONFIRMED' || booking.status === 'PENDING')
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-amber-600">DelightDine</h1>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => router.push('/booking')}>
                New Booking
              </Button>
              <Button variant="ghost" onClick={() => router.push('/')}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h2>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 mb-6">You don't have any bookings yet.</p>
            <Button onClick={() => router.push('/booking')}>
              Make a Reservation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {format(new Date(booking.bookingTime), 'MMMM d, yyyy')}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {format(new Date(booking.bookingTime), 'h:mm a')}
                    </p>
                  </div>
                  {canCancelBooking(booking) && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Party Size</p>
                    <p className="font-medium">
                      {booking.partySize}{' '}
                      {booking.partySize === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Table</p>
                    <p className="font-medium">#{booking.table.tableNumber}</p>
                  </div>
                  {booking.table.location && (
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">{booking.table.location}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-medium">~{booking.estimatedDuration} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

