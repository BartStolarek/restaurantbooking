# Restaurant Booking Application

A full-stack Next.js restaurant booking system with role-based access control, real-time availability checking, and ML-ready data collection.

## Features

### Customer Features
- **Online Reservations**: Book tables in advance with preferred time slots
- **Real-time Availability**: Check table availability instantly
- **Booking Management**: View and cancel upcoming reservations
- **Authentication**: Secure sign up and login system

### Staff Features
- **Walk-in Management**: Check availability for walk-in customers
- **Real-time Dashboard**: View today's bookings and table status
- **Booking Updates**: Mark customers as seated or completed
- **Table Overview**: Visual representation of table availability

### Manager Features
- **Table Management**: Full CRUD operations for restaurant tables
- **Booking Overview**: View all bookings with filtering options
- **Analytics Dashboard**: View booking statistics and trends
- **Data Export**: Export booking history as CSV for ML model training
- **ML Integration**: Framework for external prediction API

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM (perfect for prototyping - zero setup!)
- **Authentication**: NextAuth.js with JWT
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod validation
- **UI**: React Hot Toast for notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

**That's it!** SQLite is included - no database server needed.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd restaurantbooking
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. The database is already configured with SQLite!

The `.env` file is already set up with:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3010"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. Database is already set up! ✅

The SQLite database, migrations, and seed data are already configured.
If you need to reset it:
```bash
npm run db:reset
```

This creates:
- Default manager account: `manager@restaurant.com` / `password123`
- Default staff account: `staff@restaurant.com` / `password123`
- Default customer account: `customer@example.com` / `password123`
- 8 sample tables with various capacities

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3010](http://localhost:3010) to see the application.

**🎉 You're ready to go!** The application is fully set up with demo data.

## User Roles

### Customer
- Can create bookings online
- Can view and cancel their own bookings
- Must be logged in to make reservations

### Staff
- Can check walk-in availability
- Can view today's bookings
- Can update booking status (seat customers, mark complete)
- Can view table status in real-time

### Manager
- All staff permissions
- Can manage tables (create, update, delete)
- Can view all bookings
- Can access analytics dashboard
- Can export booking data for ML training

## ML Integration

The system is designed to integrate with an external ML prediction API for booking duration estimates.

### Configuration

Set these environment variables:
```env
ML_PREDICTION_API_URL="https://your-ml-api.com/predict"
ML_PREDICTION_API_KEY="your-api-key"
```

### API Contract

The system sends POST requests with:
```json
{
  "partySize": 4,
  "dayOfWeek": 5,
  "timeOfDay": 19
}
```

Expected response:
```json
{
  "duration": 120
}
```

### Fallback Behavior

If the ML API is unavailable or not configured:
- Falls back to heuristic-based estimates
- 2 hours for average party sizes
- Adjusted based on party size (90-150 minutes)

## Database Schema

### User
- Stores customer, staff, and manager accounts
- Passwords are hashed with bcrypt
- Role-based access control

### Table
- Restaurant table configuration
- Capacity, number, location, and status
- Status: AVAILABLE, OCCUPIED, RESERVED

### Booking
- Customer reservations and walk-ins
- Status tracking: PENDING → CONFIRMED → SEATED → COMPLETED
- Estimated and actual timing data

### BookingHistory
- ML training data storage
- Actual duration, party size, time patterns
- Exportable via manager analytics dashboard

## API Routes

### Public Routes
- `POST /api/auth/signup` - Create new customer account
- `POST /api/auth/signin` - Login (via NextAuth)

### Customer Routes (Authentication Required)
- `POST /api/bookings/check-availability` - Check table availability
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `PATCH /api/bookings/[id]` - Update booking (cancel only)

### Staff Routes (Staff/Manager Only)
- `POST /api/staff/walk-in` - Check walk-in availability
- `POST /api/staff/seat-customer` - Seat walk-in customer
- `GET /api/staff/bookings` - Get today's bookings
- `GET /api/tables` - Get all tables

### Manager Routes (Manager Only)
- `POST /api/tables` - Create new table
- `PATCH /api/tables/[id]` - Update table
- `DELETE /api/tables/[id]` - Delete table
- `GET /api/manager/bookings` - Get all bookings
- `GET /api/manager/analytics` - Get analytics and export data

### System Routes
- `POST /api/predict-duration` - ML prediction (internal use)

## Development

### Running Migrations

After schema changes:
```bash
npx prisma migrate dev --name description_of_changes
```

### Viewing Database

Use Prisma Studio:
```bash
npx prisma studio
```

### Type Generation

Regenerate Prisma types:
```bash
npx prisma generate
```

## Production Deployment

1. Set production environment variables
2. Build the application:
```bash
npm run build
```

3. Run migrations:
```bash
npx prisma migrate deploy
```

4. Start production server:
```bash
npm start
```

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Sessions**: Secure session management with NextAuth
- **Role-based Authorization**: Middleware protection on routes
- **Input Validation**: Zod schemas on all API endpoints
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **CSRF Protection**: Built into NextAuth

## Future Enhancements

- SMS/Email notifications for booking confirmations
- Payment integration for deposits
- Multi-restaurant support
- Advanced analytics and reporting
- Mobile app
- Table assignment optimization
- Real-time updates with WebSockets
- Rate limiting on booking endpoints

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
