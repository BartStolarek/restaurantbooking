import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['STAFF', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tables = await prisma.table.findMany({
      orderBy: { tableNumber: 'asc' },
    })

    return NextResponse.json({ tables })
  } catch (error) {
    console.error('Get tables error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const createTableSchema = z.object({
  tableNumber: z.number().min(1),
  capacity: z.number().min(1).max(20),
  location: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createTableSchema.parse(body)

    // Check if table number already exists
    const existingTable = await prisma.table.findUnique({
      where: { tableNumber: validatedData.tableNumber },
    })

    if (existingTable) {
      return NextResponse.json(
        { error: 'Table number already exists' },
        { status: 400 }
      )
    }

    const table = await prisma.table.create({
      data: validatedData,
    })

    return NextResponse.json({ table, message: 'Table created successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Create table error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

