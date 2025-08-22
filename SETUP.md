# Database Setup Guide

## MongoDB Setup

This project requires a MongoDB database. You have several options:

### Option 1: MongoDB Atlas (Recommended - Free)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user with read/write permissions
5. Get your connection string
6. Create a `.env` file in the project root with:

```
DATABASE_URL=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/smart_grocery
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

### Option 2: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Create a `.env` file with:

```
DATABASE_URL=mongodb://localhost:27017/smart_grocery
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

### Option 3: Run with Connection String

You can also run the seed script with a connection string directly:

```bash
npm run db:seed -- --uri="your-mongodb-connection-string"
```

## After Setup

1. Create the `.env` file with your database connection
2. Run the seed script: `npm run db:seed`
3. Start the development server: `npm run dev`

## Test Account

After seeding, you can login with:
- Email: test@smartgrocer.com
- Password: test123
