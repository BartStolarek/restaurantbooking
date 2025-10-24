import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Navigation } from '@/components/Navigation'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Experience Fine Dining
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Reserve your table at DelightDine and enjoy an unforgettable culinary experience
            with our chef's special menu and exceptional service.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href={session ? '/booking' : '/auth/signin'}>
              <Button size="lg" className="text-lg px-8 py-4">
                Book a Table
              </Button>
            </Link>
            {!session && (
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-md">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-3">Online Reservations</h3>
            <p className="text-gray-600">
              Book your table in advance and choose your preferred time slot with our
              easy-to-use reservation system.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-md">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-xl font-semibold mb-3">Walk-in Welcome</h3>
            <p className="text-gray-600">
              No reservation? No problem! Our system provides real-time availability
              and estimated wait times for walk-in guests.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-md">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-3">Special Events</h3>
            <p className="text-gray-600">
              Perfect for celebrations! Book tables for parties of any size and let us
              make your special occasion memorable.
            </p>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="mt-24 bg-white rounded-xl p-12 shadow-md">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Hours of Operation</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex justify-between">
                  <span>Monday - Thursday</span>
                  <span className="font-medium">11:00 AM - 10:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Friday - Saturday</span>
                  <span className="font-medium">11:00 AM - 11:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium">10:00 AM - 9:00 PM</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-700">
                <li>📍 123 Culinary Street, Food City, FC 12345</li>
                <li>📞 +1 (555) 123-4567</li>
                <li>📧 info@delightdine.com</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
