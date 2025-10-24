# 🚀 Quick Start - SQLite Version

## You're All Set! ✅

The database has been automatically configured with **SQLite** - no database server setup required!

### ✅ What's Already Done:

1. ✅ SQLite database created at `prisma/dev.db`
2. ✅ Database schema migrated
3. ✅ Demo users created and ready to use
4. ✅ Sample tables added

## 🎯 Just Run and Go!

```bash
npm run dev
```

Then visit: **http://localhost:3010**

## 👤 Login Credentials

Use these accounts to test the application:

### 👔 Manager Account
- **Email**: `manager@restaurant.com`
- **Password**: `password123`
- **Access**: Full system (tables, bookings, analytics)

### 🧑‍💼 Staff Account
- **Email**: `staff@restaurant.com`
- **Password**: `password123`
- **Access**: Walk-in management, today's bookings

### 👤 Customer Account
- **Email**: `customer@example.com`
- **Password**: `password123`
- **Access**: Make and manage reservations

## 🎉 That's It!

No database configuration needed. Just run `npm run dev` and start testing!

---

## 📝 Additional Commands

```bash
# View database in browser
npm run db:studio

# Reset database (deletes all data)
npm run db:reset

# Start development server
npm run dev
```

## 🔧 Why SQLite?

SQLite is perfect for prototyping:
- ✅ No database server required
- ✅ Zero configuration
- ✅ Single file database
- ✅ Perfect for development and testing
- ✅ Can easily migrate to PostgreSQL later for production

## 📊 Database Location

Your database is stored at: `prisma/dev.db`
- This file contains all your data
- It's already in `.gitignore` so it won't be committed
- Backup this file to save your data

## 🔄 Need to Start Fresh?

```bash
npm run db:reset
```

This will:
1. Delete the database
2. Recreate all tables
3. Run the seed script again (demo users + tables)

---

**Happy testing!** 🍽️

