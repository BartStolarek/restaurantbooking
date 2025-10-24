'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function WalkInPage() {
  const router = useRouter()
  const [partySize, setPartySize] = useState(2)
  const [loading, setLoading] = useState(false)
  const [availability, setAvailability] = useState<any>(null)
  const [checkComplete, setCheckComplete] = useState(false)

  const handleCheckAvailability = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/staff/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partySize }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to check availability')
        return
      }

      setAvailability(data)
      setCheckComplete(true)
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSeatCustomer = async () => {
    if (!availability?.table) {
      toast.error('No table selected')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/staff/seat-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partySize,
          tableId: availability.table.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to seat customer')
        return
      }

      toast.success('Customer seated successfully!')
      setCheckComplete(false)
      setAvailability(null)
      setPartySize(2)
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const partySizeOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? 'Person' : 'People'}`,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600">Staff Portal</h1>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => router.push('/staff/dashboard')}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => router.push('/')}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Walk-In Customer</h2>
          <p className="text-gray-600 mb-8">
            Check availability and seat walk-in customers
          </p>

          {!checkComplete ? (
            <div className="space-y-6">
              <Select
                label="Party Size"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value))}
                options={partySizeOptions}
              />

              <Button
                onClick={handleCheckAvailability}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Check Availability'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Party Size</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {partySize} {partySize === 1 ? 'person' : 'people'}
                </p>
              </div>

              {availability?.available ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <p className="text-green-800 font-medium mb-2">
                      ✓ Table Available Now!
                    </p>
                    <p className="text-green-700">
                      Table {availability.table.tableNumber}
                    </p>
                    <p className="text-green-700 text-sm">
                      Capacity: {availability.table.capacity}
                    </p>
                    {availability.table.location && (
                      <p className="text-green-700 text-sm">
                        Location: {availability.table.location}
                      </p>
                    )}
                    <p className="text-green-700 text-sm mt-2">
                      Estimated duration: {availability.estimatedDuration} minutes
                    </p>
                  </div>

                  <Button
                    onClick={handleSeatCustomer}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Seat Customer'}
                  </Button>
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p className="text-red-800 font-medium mb-2">
                    No Tables Available
                  </p>
                  {availability?.estimatedWaitMinutes && (
                    <p className="text-red-700">
                      Estimated wait time: {availability.estimatedWaitMinutes}{' '}
                      minutes
                    </p>
                  )}
                  <p className="text-red-700 text-sm mt-2">
                    Please ask the customer to wait or suggest making a reservation
                    for a later time.
                  </p>
                </div>
              )}

              <Button
                variant="secondary"
                onClick={() => {
                  setCheckComplete(false)
                  setAvailability(null)
                }}
                className="w-full"
              >
                Check Another Party
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

