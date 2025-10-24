# Login Credentials

## Demo User Accounts

The seed script creates three demo accounts for testing:

### 👔 Manager Account
- **Email**: `manager@restaurant.com`
- **Password**: `password123`
- **Access**: Full system access
  - Table management
  - View all bookings
  - Analytics & data export
  - Staff capabilities

### 🧑‍💼 Staff Account
- **Email**: `staff@restaurant.com`
- **Password**: `password123`
- **Access**: Staff operations
  - Walk-in management
  - Today's bookings dashboard
  - Seat and complete bookings
  - View table status

### 👤 Customer Account
- **Email**: `customer@example.com`
- **Password**: `password123`
- **Access**: Customer features
  - Make reservations
  - View personal bookings
  - Cancel bookings

## Application URL

- **Local Development**: http://localhost:3020
- **Note**: The application now runs on port **3020** by default

## How to Set Up

If you haven't already set up the database, run these commands:

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Create database tables
npm run db:migrate

# 3. Seed the database with demo users and tables
npm run db:seed

# 4. Start the development server
npm run dev
```

## Creating Additional Users

### Via Sign Up Page
- Go to http://localhost:3020/auth/signup
- Fill in the form (new users are created as CUSTOMER role)

### Via Database (for Staff/Manager roles)
1. Open Prisma Studio: `npm run db:studio`
2. Navigate to User model
3. Create new user with desired role
4. Password must be hashed with bcrypt (use 10 salt rounds)

## Security Notes

⚠️ **IMPORTANT**: These are demo credentials for development only!

- Change all passwords before deploying to production
- Use a strong NEXTAUTH_SECRET in production
- Never commit the `.env` file to version control
- Consider implementing password reset functionality

## Quick Start

1. Make sure PostgreSQL is running
2. Update `DATABASE_URL` in `.env` with your database credentials
3. Run: `npm run db:migrate && npm run db:seed`
4. Run: `npm run dev`
5. Visit: http://localhost:3020
6. Log in with any of the accounts above!

---

Happy testing! 🍽️

