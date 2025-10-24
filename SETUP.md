# Quick Setup Guide

Follow these steps to get your restaurant booking application up and running.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed
- PostgreSQL database running (locally or cloud)
- Git (optional, for version control)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

Note: We use `--legacy-peer-deps` due to Next.js 16 compatibility with NextAuth.

### 2. Configure Environment Variables

The `.env` file has been created for you. Update it with your actual database credentials:

```bash
# Open .env in your editor
nano .env  # or use your preferred editor
```

Update the `DATABASE_URL` with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/restaurant_booking?schema=public"
```

**Important**: Change `NEXTAUTH_SECRET` to a random string in production:
```bash
# Generate a secure secret (on Linux/Mac):
openssl rand -base64 32
```

### 3. Set Up the Database

Generate Prisma Client:
```bash
npm run db:generate
```

Create the database schema:
```bash
npm run db:migrate
```

When prompted for a migration name, enter something like: `init`

Seed the database with sample data:
```bash
npm run db:seed
```

This creates:
- 3 demo user accounts (see below)
- 8 sample restaurant tables

### 4. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3020](http://localhost:3020)

## Demo Accounts

After seeding, you can log in with these accounts:

### Manager Account
- Email: `manager@restaurant.com`
- Password: `password123`
- Access: Full system access including table management and analytics

### Staff Account
- Email: `staff@restaurant.com`
- Password: `password123`
- Access: Walk-in management and today's bookings

### Customer Account
- Email: `customer@example.com`
- Password: `password123`
- Access: Make and manage personal bookings

## Common Issues & Solutions

### Database Connection Error

If you see `PrismaClientInitializationError`:
- Verify PostgreSQL is running: `pg_isready`
- Check your DATABASE_URL in `.env`
- Ensure the database exists: `createdb restaurant_booking`

### Prisma Client Not Generated

If you see import errors for `@prisma/client`:
```bash
npm run db:generate
```

### Port Already in Use

If port 3000 is busy:
```bash
# Use a different port
PORT=3001 npm run dev
```

### Environment Variables Not Loading

Ensure you're in the project root directory when running commands.

## Next Steps

1. **Customize Tables**: Log in as manager and go to Table Management to add your actual tables

2. **Test Booking Flow**: 
   - Sign up a new customer account
   - Make a test reservation
   - Log in as staff to see the booking

3. **Configure ML API** (Optional):
   - Set `ML_PREDICTION_API_URL` in `.env`
   - System falls back to 2-hour estimates if not configured

4. **Production Deployment**:
   - See README.md for production setup
   - Change all default passwords
   - Use a strong NEXTAUTH_SECRET
   - Enable SSL for database connection

## Useful Commands

```bash
# View database in browser
npm run db:studio

# Reset database (WARNING: deletes all data)
npm run db:reset

# Run linter
npm run lint

# Build for production
npm run build
```

## Getting Help

- Check the main [README.md](./README.md) for detailed documentation
- View API documentation in README.md
- Check database schema in `prisma/schema.prisma`

## Architecture Overview

```
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── booking/          # Customer booking
│   ├── my-bookings/      # Customer bookings view
│   ├── staff/            # Staff dashboard & walk-in
│   └── manager/          # Manager dashboard & analytics
├── components/
│   └── ui/               # Reusable UI components
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client instance
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding
└── types/               # TypeScript definitions
```

Happy booking! 🍽️

