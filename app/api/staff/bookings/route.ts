import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['STAFF', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')

    const today = date ? new Date(date) : new Date()

    const bookings = await prisma.booking.findMany({
      where: {
        bookingTime: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'SEATED'],
        },
      },
      include: {
        table: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        bookingTime: 'asc',
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get staff bookings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

