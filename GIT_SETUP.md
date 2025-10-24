# Git Setup Guide

## What's Tracked in Version Control

This project uses Git with the following configuration:

### ✅ Tracked Files

- **Source Code**: All JavaScript/TypeScript files
- **Configuration**: package.json, tsconfig.json, etc.
- **Database**: `prisma/dev.db` (SQLite database with demo data)
- **Environment Template**: `.env.example` (safe template)
- **Documentation**: All `.md` files

### 🚫 Ignored Files

- **Dependencies**: `node_modules/`
- **Build Output**: `.next/`, `build/`, `dist/`
- **Environment Variables**: `.env` (contains secrets)
- **IDE Settings**: Most IDE-specific folders
- **OS Files**: `.DS_Store`, `Thumbs.db`
- **Logs**: `*.log`

## Important Notes

### 📦 Database Included

**The SQLite database is tracked in Git** for easy setup and demo purposes:
- Contains 3 demo users (manager, staff, customer)
- Includes 8 sample restaurant tables
- Makes it easy to clone and run immediately

**For production**: You should:
1. Remove the database from Git tracking
2. Use a separate production database (PostgreSQL recommended)
3. Add `prisma/dev.db` to `.gitignore`

### 🔐 Environment Variables

- **`.env`** is **ignored** (not tracked) - contains your actual secrets
- **`.env.example`** is **tracked** - safe template for others

When cloning the project, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Current `.env` contains:
- `DATABASE_URL` - Points to local SQLite database
- `NEXTAUTH_SECRET` - Change this in production!
- `NEXTAUTH_URL` - Application URL

### 🎯 First-Time Setup After Clone

If someone clones this repository:

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Environment is already set up (using .env.example)
# Database is already included in the repo!

# 3. Generate Prisma Client
npm run db:generate

# 4. Start the app
npm run dev
```

**No migrations or seeding needed!** The database is ready to go.

## Git Best Practices

### Before Committing

```bash
# Check what will be committed
git status

# Make sure .env is not staged
git status | grep .env

# Add your changes
git add .

# Commit with a clear message
git commit -m "Your descriptive message"
```

### Sensitive Information

**Never commit**:
- API keys
- Passwords
- Database credentials (for production)
- Private keys
- Session secrets

**Always use** `.env` for secrets and keep `.env` in `.gitignore`.

### Database Management

If you want to **stop tracking the database** later:

```bash
# Add to .gitignore
echo "prisma/dev.db" >> .gitignore
echo "prisma/dev.db-journal" >> .gitignore

# Remove from Git but keep the file
git rm --cached prisma/dev.db

# Commit the change
git commit -m "Stop tracking SQLite database"
```

## Recommended .gitignore Entries

Current `.gitignore` includes standard Next.js + Prisma patterns:
- Node modules and dependencies
- Next.js build artifacts
- Environment files (except .env.example)
- IDE-specific files
- OS-specific files
- Log files
- Temporary files

The database lines are **commented out** to allow tracking:
```gitignore
# SQLite database - INCLUDED IN GIT for demo purposes
# prisma/dev.db
# prisma/dev.db-journal
```

Uncomment these lines to stop tracking the database.

---

**Ready to commit?** 🚀

Your `.gitignore` is properly configured for a Next.js + Prisma + SQLite project!

