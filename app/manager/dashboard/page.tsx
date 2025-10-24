'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function ManagerDashboard() {
  const router = useRouter()

  const menuItems = [
    {
      title: 'Table Management',
      description: 'Add, edit, or remove tables',
      icon: '🪑',
      path: '/manager/tables',
    },
    {
      title: 'All Bookings',
      description: 'View and manage all restaurant bookings',
      icon: '📅',
      path: '/manager/bookings',
    },
    {
      title: 'Analytics & Data Export',
      description: 'View statistics and export ML training data',
      icon: '📊',
      path: '/manager/analytics',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-purple-600">Manager Portal</h1>
            <Button variant="ghost" onClick={() => router.push('/')}>
              Home
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Manager Dashboard</h2>
        <p className="text-gray-600 mb-12">
          Manage your restaurant's tables, bookings, and analytics
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow text-left"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

