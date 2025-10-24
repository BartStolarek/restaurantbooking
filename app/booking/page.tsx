'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { format, addDays, addMinutes } from 'date-fns'
import toast from 'react-hot-toast'

export default function BookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form data
  const [partySize, setPartySize] = useState(2)
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [time, setTime] = useState('19:00')

  // Availability result
  const [availability, setAvailability] = useState<any>(null)

  const handleCheckAvailability = async () => {
    setLoading(true)
    try {
      const bookingTime = new Date(`${date}T${time}:00`)

      const response = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partySize,
          bookingTime: bookingTime.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to check availability')
        return
      }

      setAvailability(data)
      setStep(2)
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmBooking = async () => {
    setLoading(true)
    try {
      const bookingTime = new Date(`${date}T${time}:00`)

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partySize,
          bookingTime: bookingTime.toISOString(),
          tableId: availability.table?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to create booking')
        return
      }

      toast.success('Booking confirmed!')
      router.push('/my-bookings')
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Generate time slots (every 30 minutes from 11:00 to 22:00)
  const timeSlots = []
  for (let hour = 11; hour <= 22; hour++) {
    timeSlots.push({ value: `${hour.toString().padStart(2, '0')}:00`, label: `${hour}:00` })
    if (hour < 22) {
      timeSlots.push({ value: `${hour.toString().padStart(2, '0')}:30`, label: `${hour}:30` })
    }
  }

  const partySizeOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? 'Person' : 'People'}`,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-amber-600">DelightDine</h1>
            <Button variant="ghost" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Book a Table</h2>
          <p className="text-gray-600 mb-8">
            Reserve your table and enjoy an exceptional dining experience
          </p>

          {step === 1 && (
            <div className="space-y-6">
              <Select
                label="Party Size"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value))}
                options={partySizeOptions}
              />

              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 90), 'yyyy-MM-dd')}
              />

              <Select
                label="Time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                options={timeSlots}
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
          )}

          {step === 2 && availability && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Party Size:</span> {partySize}{' '}
                    {partySize === 1 ? 'person' : 'people'}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {time}
                  </p>
                </div>
              </div>

              {availability.available ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <p className="text-green-800 font-medium mb-2">
                    ✓ Table Available!
                  </p>
                  <p className="text-green-700 text-sm">
                    Table {availability.table.tableNumber} (capacity:{' '}
                    {availability.table.capacity})
                    {availability.table.location && ` - ${availability.table.location}`}
                  </p>
                  <p className="text-green-700 text-sm mt-2">
                    Estimated duration: {availability.estimatedDuration} minutes
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800 font-medium mb-2">
                    No tables available at this time
                  </p>
                  {availability.estimatedWaitMinutes && (
                    <p className="text-yellow-700 text-sm">
                      Estimated wait time: {availability.estimatedWaitMinutes} minutes
                    </p>
                  )}
                  {availability.nextAvailableTime && (
                    <p className="text-yellow-700 text-sm">
                      Next available:{' '}
                      {format(new Date(availability.nextAvailableTime), 'h:mm a')}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStep(1)
                    setAvailability(null)
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                {availability.available && (
                  <Button
                    onClick={handleConfirmBooking}
                    disabled={loading}
                    className="flex-1"
                    size="lg"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Confirm Booking'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

