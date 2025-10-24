import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED']).optional(),
  actualStartTime: z.string().optional(),
  actualEndTime: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateBookingSchema.parse(body)

    // Get the booking to check permissions
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Customers can only cancel their own bookings
    if (session.user.role === 'CUSTOMER') {
      if (booking.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (validatedData.status && validatedData.status !== 'CANCELLED') {
        return NextResponse.json(
          { error: 'Customers can only cancel bookings' },
          { status: 403 }
        )
      }
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.actualStartTime && {
          actualStartTime: new Date(validatedData.actualStartTime),
        }),
        ...(validatedData.actualEndTime && {
          actualEndTime: new Date(validatedData.actualEndTime),
        }),
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
    })

    // If booking is completed, create booking history for ML training
    if (
      validatedData.status === 'COMPLETED' &&
      updatedBooking.actualStartTime &&
      updatedBooking.actualEndTime
    ) {
      const actualStart = new Date(updatedBooking.actualStartTime)
      const actualEnd = new Date(updatedBooking.actualEndTime)
      const actualDuration = Math.round(
        (actualEnd.getTime() - actualStart.getTime()) / 60000
      )

      await prisma.bookingHistory.create({
        data: {
          bookingId: updatedBooking.id,
          partySize: updatedBooking.partySize,
          actualDuration,
          tableCapacity: updatedBooking.table?.capacity || 0,
          dayOfWeek: actualStart.getDay(),
          timeOfDay: actualStart.getHours(),
          date: actualStart,
        },
      })
    }

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Booking updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

