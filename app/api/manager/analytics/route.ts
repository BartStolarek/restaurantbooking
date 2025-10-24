import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') // 'json' or 'csv'

    // Get all booking history
    const bookingHistory = await prisma.bookingHistory.findMany({
      include: {
        booking: {
          select: {
            bookingType: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Calculate statistics
    const totalBookings = bookingHistory.length
    const avgDuration =
      totalBookings > 0
        ? bookingHistory.reduce((sum, bh) => sum + bh.actualDuration, 0) /
          totalBookings
        : 0

    const durationsByPartySize = bookingHistory.reduce((acc, bh) => {
      if (!acc[bh.partySize]) {
        acc[bh.partySize] = []
      }
      acc[bh.partySize].push(bh.actualDuration)
      return acc
    }, {} as Record<number, number[]>)

    const avgDurationByPartySize = Object.entries(durationsByPartySize).map(
      ([partySize, durations]) => ({
        partySize: parseInt(partySize),
        avgDuration:
          durations.reduce((sum, d) => sum + d, 0) / durations.length,
        count: durations.length,
      })
    )

    // If CSV format requested, return CSV
    if (format === 'csv') {
      const csvHeaders = [
        'Date',
        'Party Size',
        'Actual Duration (min)',
        'Table Capacity',
        'Day of Week',
        'Time of Day',
        'Booking Type',
      ]
      const csvRows = bookingHistory.map((bh) => [
        bh.date.toISOString(),
        bh.partySize,
        bh.actualDuration,
        bh.tableCapacity,
        bh.dayOfWeek,
        bh.timeOfDay,
        bh.booking.bookingType,
      ])

      const csv = [
        csvHeaders.join(','),
        ...csvRows.map((row) => row.join(',')),
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="booking_history.csv"',
        },
      })
    }

    // Return JSON
    return NextResponse.json({
      statistics: {
        totalBookings,
        avgDuration: Math.round(avgDuration),
        avgDurationByPartySize,
      },
      bookingHistory,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

