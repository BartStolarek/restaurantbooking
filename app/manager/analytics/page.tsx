'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Analytics {
  statistics: {
    totalBookings: number
    avgDuration: number
    avgDurationByPartySize: {
      partySize: number
      avgDuration: number
      count: number
    }[]
  }
  bookingHistory: any[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/manager/analytics')
      const data = await response.json()

      if (response.ok) {
        setAnalytics(data)
      } else {
        toast.error('Failed to load analytics')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/manager/analytics?format=csv')

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `booking_history_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('CSV exported successfully')
      } else {
        toast.error('Failed to export CSV')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
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
              <Button variant="ghost" onClick={() => router.push('/manager/tables')}>
                Tables
              </Button>
              <Button variant="ghost" onClick={() => router.push('/manager/bookings')}>
                Bookings
              </Button>
              <Button variant="ghost" onClick={() => router.push('/')}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
          <Button onClick={handleExportCSV}>Export Training Data (CSV)</Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Total Completed Bookings</p>
            <p className="text-4xl font-bold text-purple-600">
              {analytics?.statistics.totalBookings || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Average Duration</p>
            <p className="text-4xl font-bold text-purple-600">
              {analytics?.statistics.avgDuration || 0}
              <span className="text-xl text-gray-600 ml-2">min</span>
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">ML Training Ready</p>
            <p className="text-4xl font-bold text-green-600">
              {analytics?.bookingHistory.length || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">data points available</p>
          </div>
        </div>

        {/* Average Duration by Party Size */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">
            Average Duration by Party Size
          </h3>
          {analytics?.statistics.avgDurationByPartySize.length === 0 ? (
            <p className="text-gray-600">
              No data available yet. Complete some bookings to see statistics.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics?.statistics.avgDurationByPartySize.map((data) => (
                <div key={data.partySize} className="flex items-center">
                  <div className="w-32">
                    <span className="font-medium">
                      {data.partySize} {data.partySize === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="bg-purple-500 rounded-full h-6 flex items-center justify-end pr-3 text-white text-sm font-medium"
                        style={{
                          width: `${Math.min(
                            (data.avgDuration / 180) * 100,
                            100
                          )}%`,
                        }}
                      >
                        {Math.round(data.avgDuration)} min
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm text-gray-600">
                    {data.count} bookings
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ML Integration Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-3 text-indigo-900">
            ML Model Integration
          </h3>
          <p className="text-gray-700 mb-4">
            The system collects booking duration data for machine learning model
            training. Export the data using the button above and use it to train your
            prediction model.
          </p>
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Data collected includes:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Party size</li>
              <li>Actual booking duration</li>
              <li>Table capacity</li>
              <li>Day of week and time of day</li>
              <li>Booking type (reservation vs walk-in)</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Configure your ML prediction API URL in the environment variables
            (ML_PREDICTION_API_URL). The system will fall back to a 2-hour estimate if
            the API is unavailable.
          </p>
        </div>
      </div>
    </div>
  )
}

