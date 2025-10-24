import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create default manager user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const manager = await prisma.user.upsert({
    where: { email: 'manager@restaurant.com' },
    update: {},
    create: {
      email: 'manager@restaurant.com',
      password: hashedPassword,
      name: 'Restaurant Manager',
      phone: '+1234567890',
      role: 'MANAGER',
    },
  })

  const staff = await prisma.user.upsert({
    where: { email: 'staff@restaurant.com' },
    update: {},
    create: {
      email: 'staff@restaurant.com',
      password: hashedPassword,
      name: 'Restaurant Staff',
      phone: '+1234567891',
      role: 'STAFF',
    },
  })

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: hashedPassword,
      name: 'Test Customer',
      phone: '+1234567892',
      role: 'CUSTOMER',
    },
  })

  console.log('Users created:', { manager, staff, customer })

  // Create tables
  const tables = [
    { tableNumber: 1, capacity: 2, location: 'Window' },
    { tableNumber: 2, capacity: 2, location: 'Window' },
    { tableNumber: 3, capacity: 4, location: 'Main Floor' },
    { tableNumber: 4, capacity: 4, location: 'Main Floor' },
    { tableNumber: 5, capacity: 6, location: 'Main Floor' },
    { tableNumber: 6, capacity: 8, location: 'Private Room' },
    { tableNumber: 7, capacity: 2, location: 'Bar Area' },
    { tableNumber: 8, capacity: 4, location: 'Patio' },
  ]

  for (const table of tables) {
    await prisma.table.upsert({
      where: { tableNumber: table.tableNumber },
      update: {},
      create: table,
    })
  }

  console.log('Tables created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

