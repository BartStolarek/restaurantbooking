'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

export function Navigation() {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-amber-600 cursor-pointer">
                DelightDine
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-gray-700">Welcome, {session.user.name}!</span>
                {session.user.role === 'MANAGER' && (
                  <Link href="/manager/dashboard">
                    <Button variant="ghost">Manager Dashboard</Button>
                  </Link>
                )}
                {session.user.role === 'STAFF' && (
                  <Link href="/staff/dashboard">
                    <Button variant="ghost">Staff Dashboard</Button>
                  </Link>
                )}
                {session.user.role === 'CUSTOMER' && (
                  <Link href="/my-bookings">
                    <Button variant="ghost">My Bookings</Button>
                  </Link>
                )}
                <Button variant="secondary" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

