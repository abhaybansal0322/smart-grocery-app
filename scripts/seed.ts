import dotenv from "dotenv";
import path from "path";
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const envPath = path.resolve(__dirname, "..", ".env"); 
// because scripts/seed.ts is inside /scripts, so ".." goes up one level

console.log("Loading from:", envPath);

// Check if .env file exists
import fs from 'fs';
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  console.error('Please create a .env file in the project root with your DATABASE_URL');
  process.exit(1);
}

dotenv.config({ path: envPath });

console.log("DATABASE_URL =", process.env.DATABASE_URL);


function getCliArgUri(): string | undefined {
  const args = process.argv.slice(2)
  for (const arg of args) {
    const [rawKey, ...rest] = arg.split('=')
    const key = rawKey.replace(/^--/, '')
    const value = rest.join('=')
    if (!value) continue
    if (key === 'uri' || key === 'database-url') return value
  }
  return undefined
}

async function getDb() {
  const uri = getCliArgUri() || process.env.DATABASE_URL
  
  if (!uri) {
    console.error('❌ DATABASE_URL must be set');
    console.error('');
    console.error('🔧 To fix this, you need to:');
    console.error('');
    console.error('1. Create a .env file in the project root with:');
    console.error('   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/smart_grocery');
    console.error('');
    console.error('2. Or use MongoDB Atlas (free):');
    console.error('   - Go to https://cloud.mongodb.com');
    console.error('   - Create a free cluster');
    console.error('   - Get your connection string');
    console.error('   - Add it to .env file');
    console.error('');
    console.error('3. Or run with connection string:');
    console.error('   npm run db:seed -- --uri="your-mongodb-connection-string"');
    console.error('');
    console.error('📝 Example .env file content:');
    console.error('   DATABASE_URL=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/smart_grocery');
    console.error('   JWT_SECRET=your-secret-key');
    console.error('');
    throw new Error('DATABASE_URL must be set')
  }
  
  console.log('🔗 Connecting to MongoDB...');
  const client = new MongoClient(uri)
  await client.connect()
  const dbName = (() => { try { const u = new URL(uri); const p = u.pathname?.replace(/^\//,''); return p || 'smart_grocery' } catch { return 'smart_grocery' } })()
  console.log('✅ Connected to database:', dbName);
  return { db: client.db(dbName), client }
}

const products = [
  { name: 'Organic Chicken Breast', description: 'Fresh organic chicken breast, antibiotic-free', category: 'proteins', subcategory: 'organic', price: 1299, unit: 'lb', isOrganic: true, isLocal: false, isSeasonal: false, carbonFootprint: 2.5, calories: 165, protein: 31, carbs: 0, fat: 3.6, brand: 'Organic Valley', imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop', alt: 'Organic chicken breast', isPrimary: true }, { url: 'https://images.unsplash.com/photo-1588169219307-4c49f8f1e6f0?w=800&h=600&fit=crop', alt: 'Chicken cooked' }] },
  { name: 'Wild Salmon Fillets', description: 'Fresh wild-caught Alaskan salmon', category: 'proteins', subcategory: 'wild-caught', price: 1899, unit: 'lb', isOrganic: false, isLocal: false, isSeasonal: false, carbonFootprint: 3.2, calories: 208, protein: 25, carbs: 0, fat: 12, brand: 'Alaska Seafood', imageUrl: 'https://images.pexels.com/photos/1683545/pexels-photo-1683545.jpeg?w=400&h=300&fit=crop', images: [{ url: 'https://images.pexels.com/photos/1683545/pexels-photo-1683545.jpeg?w=800&h=600&fit=crop', alt: 'Wild salmon fillets', isPrimary: true }] },
  { name: 'Grass-Fed Beef Ground', description: 'Premium grass-fed ground beef', category: 'proteins', subcategory: 'grass-fed', price: 899, unit: 'lb', isOrganic: false, isLocal: true, isSeasonal: false, carbonFootprint: 4.1, calories: 250, protein: 26, carbs: 0, fat: 15, brand: 'Local Farm Co', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop', alt: 'Ground beef', isPrimary: true }] },
  { name: 'Organic Spinach', description: 'Fresh organic baby spinach leaves', category: 'vegetables', subcategory: 'organic', price: 399, unit: 'pack', isOrganic: true, isLocal: true, isSeasonal: false, carbonFootprint: 0.3, calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, brand: 'Green Valley', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=600&fit=crop', alt: 'Organic spinach', isPrimary: true }] },
  { name: 'Heirloom Tomatoes', description: 'Locally grown heirloom tomatoes', category: 'vegetables', subcategory: 'heirloom', price: 599, unit: 'lb', isOrganic: false, isLocal: true, isSeasonal: true, carbonFootprint: 0.2, calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, brand: 'Local Farm Co', imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&h=600&fit=crop', alt: 'Heirloom tomatoes', isPrimary: true }] },
  { name: 'Organic Bell Peppers', description: 'Mixed color organic bell peppers', category: 'vegetables', subcategory: 'organic', price: 449, unit: 'lb', isOrganic: true, isLocal: false, isSeasonal: false, carbonFootprint: 0.4, calories: 31, protein: 1, carbs: 7.2, fat: 0.3, brand: 'Organic Valley', imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=800&auto=format&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=1200&auto=format&fit=crop', alt: 'Bell peppers', isPrimary: true }] },
  { name: 'Organic Avocados', description: 'Ripe organic Hass avocados', category: 'fruits', subcategory: 'organic', price: 549, unit: 'pack', isOrganic: true, isLocal: false, isSeasonal: false, carbonFootprint: 0.8, calories: 160, protein: 2, carbs: 9, fat: 15, brand: 'Organic Valley', imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&h=600&fit=crop', alt: 'Avocados', isPrimary: true }] },
  { name: 'Local Strawberries', description: 'Fresh local strawberries', category: 'fruits', subcategory: 'local', price: 399, unit: 'pack', isOrganic: false, isLocal: true, isSeasonal: true, carbonFootprint: 0.1, calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, brand: 'Local Farm Co', imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=800&auto=format&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=1200&auto=format&fit=crop', alt: 'Strawberries', isPrimary: true }] },
  { name: 'Organic Bananas', description: 'Organic fair-trade bananas', category: 'fruits', subcategory: 'organic', price: 199, unit: 'lb', isOrganic: true, isLocal: false, isSeasonal: false, carbonFootprint: 0.6, calories: 89, protein: 1.1, carbs: 23, fat: 0.3, brand: 'Fair Trade Co', imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=800&h=600&fit=crop', alt: 'Bananas', isPrimary: true }] },
  { name: 'Organic Greek Yogurt', description: 'Creamy organic Greek yogurt', category: 'dairy', subcategory: 'organic', price: 699, unit: 'pack', isOrganic: true, isLocal: false, isSeasonal: false, carbonFootprint: 1.2, calories: 130, protein: 23, carbs: 9, fat: 0, brand: 'Organic Valley', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop', alt: 'Greek yogurt', isPrimary: true }] },
  { name: 'Local Farm Eggs', description: 'Fresh farm eggs from local chickens', category: 'dairy', subcategory: 'local', price: 599, unit: 'dozen', isOrganic: false, isLocal: true, isSeasonal: false, carbonFootprint: 0.8, calories: 70, protein: 6, carbs: 0.6, fat: 5, brand: 'Local Farm Co', imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&h=600&fit=crop', alt: 'Farm eggs', isPrimary: true }] },
  { name: 'Organic Cheddar Cheese', description: 'Aged organic cheddar cheese', category: 'dairy', subcategory: 'organic', price: 899, unit: 'lb', isOrganic: true, isLocal: false, isSeasonal: false, carbonFootprint: 2.1, calories: 113, protein: 7, carbs: 0.4, fat: 9, brand: 'Organic Valley', imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=600&fit=crop', alt: 'Cheddar cheese', isPrimary: true }] },
  { name: 'Organic Quinoa', description: 'Premium organic quinoa', category: 'grains', subcategory: 'organic', price: 899, unit: 'lb', isOrganic: true, isLocal: false, isSeasonal: false, carbonFootprint: 0.5, calories: 120, protein: 4.4, carbs: 22, fat: 1.9, brand: 'Organic Valley', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop', alt: 'Quinoa', isPrimary: true }] },
  { name: 'Whole Grain Bread', description: 'Fresh whole grain artisan bread', category: 'grains', subcategory: 'artisan', price: 499, unit: 'loaf', isOrganic: false, isLocal: true, isSeasonal: false, carbonFootprint: 0.7, calories: 80, protein: 3, carbs: 15, fat: 1, brand: 'Local Bakery', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop', alt: 'Whole grain bread', isPrimary: true }] },
  { name: 'Organic Brown Rice', description: 'Long grain organic brown rice', category: 'grains', subcategory: 'organic', price: 399, unit: 'lb', isOrganic: true, isLocal: false, isSeasonal: false, carbonFootprint: 0.4, calories: 110, protein: 2.5, carbs: 23, fat: 0.9, brand: 'Organic Valley', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop', alt: 'Brown rice', isPrimary: true }] },
  { name: 'Organic Almonds', description: 'Raw organic almonds', category: 'snacks', subcategory: 'organic', price: 1299, unit: 'lb', isOrganic: true, isLocal: false, isSeasonal: false, carbonFootprint: 1.8, calories: 164, protein: 6, carbs: 6, fat: 14, brand: 'Organic Valley', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', alt: 'Almonds', isPrimary: true }] },
  { name: 'Local Honey', description: 'Pure local honey from nearby apiaries', category: 'snacks', subcategory: 'local', price: 899, unit: 'jar', isOrganic: false, isLocal: true, isSeasonal: false, carbonFootprint: 0.3, calories: 60, protein: 0, carbs: 17, fat: 0, brand: 'Local Farm Co', imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop', alt: 'Local honey', isPrimary: true }] },
  { name: 'Organic Dark Chocolate', description: '70% organic dark chocolate', category: 'snacks', subcategory: 'organic', price: 699, unit: 'bar', isOrganic: true, isLocal: false, isSeasonal: false, carbonFootprint: 1.2, calories: 150, protein: 2, carbs: 15, fat: 10, brand: 'Fair Trade Co', imageUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=300&fit=crop', images: [{ url: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&h=600&fit=crop', alt: 'Dark chocolate', isPrimary: true }] }
]

async function main() {
  console.log('🌱 Starting database seed...')
  
  try {
    const { db, client } = await getDb()
    const Users = db.collection('User')
    const Products = db.collection('Product')
    const Profiles = db.collection('UserProfile')
    const Subscriptions = db.collection('Subscription')

    console.log('🗑️  Clearing existing data...')
    await Promise.all([
      Users.deleteMany({}),
      Products.deleteMany({}),
      Profiles.deleteMany({}),
      Subscriptions.deleteMany({})
    ])
    console.log('✅ Cleared Users, Products, UserProfile, Subscription')

  for (const product of products) {
    await Products.insertOne({ ...product, createdAt: new Date(), updatedAt: new Date(), inStock: true, stockLevel: 100 })
  }
  console.log(`✅ Created ${products.length} products`)

  const hashedPassword = await bcrypt.hash('test123', 12)
  const now = new Date()
  const userInsert = await Users.insertOne({
    email: 'test@smartgrocer.com',
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'User',
    createdAt: now,
    updatedAt: now
  })
  const testUserId = String(userInsert.insertedId)
  await Profiles.insertOne({
    userId: testUserId,
    householdSize: 2,
    weeklyBudget: 15000,
    dietaryRestrictions: ['Vegetarian'],
    allergies: ['Nuts'],
    cookingTime: 30,
    mealTypes: ['Quick & Easy', 'Healthy Options'],
    shoppingFrequency: 'weekly',
    preferredDeliveryDay: 'saturday',
    deliveryMethod: 'delivery',
    sustainabilityImportance: 8,
    createdAt: now,
    updatedAt: now
  })

  await Subscriptions.insertOne({
    userId: testUserId,
    name: 'My Full Box',
    type: 'full',
    frequency: 'weekly',
    nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxItems: 25,
    maxBudget: 15000,
    aiEnabled: true,
    customizationLevel: 'moderate',
    createdAt: now,
    updatedAt: now
  })

    console.log('✅ Created test user account:')
    console.log('   Email: test@smartgrocer.com')
    console.log('   Password: test123')
    console.log('   Subscription: Full Box (weekly)')

    console.log('🎉 Database seeding completed!')
    await client.close()
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {})


