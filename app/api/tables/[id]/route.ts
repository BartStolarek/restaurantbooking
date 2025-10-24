import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTableSchema = z.object({
  tableNumber: z.number().min(1).optional(),
  capacity: z.number().min(1).max(20).optional(),
  location: z.string().optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED']).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateTableSchema.parse(body)

    // Check if table exists
    const table = await prisma.table.findUnique({
      where: { id: params.id },
    })

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    // If updating table number, check if it's already taken
    if (
      validatedData.tableNumber &&
      validatedData.tableNumber !== table.tableNumber
    ) {
      const existingTable = await prisma.table.findUnique({
        where: { tableNumber: validatedData.tableNumber },
      })

      if (existingTable) {
        return NextResponse.json(
          { error: 'Table number already exists' },
          { status: 400 }
        )
      }
    }

    const updatedTable = await prisma.table.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({
      table: updatedTable,
      message: 'Table updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Update table error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if table has active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        tableId: params.id,
        status: { in: ['PENDING', 'CONFIRMED', 'SEATED'] },
      },
    })

    if (activeBookings) {
      return NextResponse.json(
        { error: 'Cannot delete table with active bookings' },
        { status: 400 }
      )
    }

    await prisma.table.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Table deleted successfully' })
  } catch (error) {
    console.error('Delete table error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

