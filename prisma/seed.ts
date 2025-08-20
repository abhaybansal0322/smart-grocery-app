import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'

const prisma = new PrismaClient()

const products = [
  // Proteins
  {
    name: 'Organic Chicken Breast',
    description: 'Fresh organic chicken breast, antibiotic-free',
    category: 'proteins',
    subcategory: 'organic',
    price: 1299, // $12.99
    unit: 'lb',
    isOrganic: true,
    isLocal: false,
    isSeasonal: false,
    carbonFootprint: 2.5,
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    brand: 'Organic Valley',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop'
  },
  {
    name: 'Wild Salmon Fillets',
    description: 'Fresh wild-caught Alaskan salmon',
    category: 'proteins',
    subcategory: 'wild-caught',
    price: 1899,
    unit: 'lb',
    isOrganic: false,
    isLocal: false,
    isSeasonal: false,
    carbonFootprint: 3.2,
    calories: 208,
    protein: 25,
    carbs: 0,
    fat: 12,
    brand: 'Alaska Seafood',
    imageUrl: 'https://images.pexels.com/photos/1683545/pexels-photo-1683545.jpeg?w=400&h=300&fit=crop'
  },
  {
    name: 'Grass-Fed Beef Ground',
    description: 'Premium grass-fed ground beef',
    category: 'proteins',
    subcategory: 'grass-fed',
    price: 899,
    unit: 'lb',
    isOrganic: false,
    isLocal: true,
    isSeasonal: false,
    carbonFootprint: 4.1,
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 15,
    brand: 'Local Farm Co',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop'
  },

  // Vegetables
  {
    name: 'Organic Spinach',
    description: 'Fresh organic baby spinach leaves',
    category: 'vegetables',
    subcategory: 'organic',
    price: 399,
    unit: 'pack',
    isOrganic: true,
    isLocal: true,
    isSeasonal: false,
    carbonFootprint: 0.3,
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    brand: 'Green Valley',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop'
  },
  {
    name: 'Heirloom Tomatoes',
    description: 'Locally grown heirloom tomatoes',
    category: 'vegetables',
    subcategory: 'heirloom',
    price: 599,
    unit: 'lb',
    isOrganic: false,
    isLocal: true,
    isSeasonal: true,
    carbonFootprint: 0.2,
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    brand: 'Local Farm Co',
    imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop'
  },
  {
    name: 'Organic Bell Peppers',
    description: 'Mixed color organic bell peppers',
    category: 'vegetables',
    subcategory: 'organic',
    price: 449,
    unit: 'lb',
    isOrganic: true,
    isLocal: false,
    isSeasonal: false,
    carbonFootprint: 0.4,
    calories: 31,
    protein: 1,
    carbs: 7.2,
    fat: 0.3,
    brand: 'Organic Valley',
    imageUrl: 'https://images.unsplash.com/photo-1525607551316-5a9e1c8b3c8c?w=400&h=300&fit=crop'
  },

  // Fruits
  {
    name: 'Organic Avocados',
    description: 'Ripe organic Hass avocados',
    category: 'fruits',
    subcategory: 'organic',
    price: 549,
    unit: 'pack',
    isOrganic: true,
    isLocal: false,
    isSeasonal: false,
    carbonFootprint: 0.8,
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    brand: 'Organic Valley',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop'
  },
  {
    name: 'Local Strawberries',
    description: 'Fresh local strawberries',
    category: 'fruits',
    subcategory: 'local',
    price: 399,
    unit: 'pack',
    isOrganic: false,
    isLocal: true,
    isSeasonal: true,
    carbonFootprint: 0.1,
    calories: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
    brand: 'Local Farm Co',
    imageUrl: 'https://images.pexels.com/photos/1464965911861-746a04b4bca6?w=400&h=300&fit=crop'
  },
  {
    name: 'Organic Bananas',
    description: 'Organic fair-trade bananas',
    category: 'fruits',
    subcategory: 'organic',
    price: 199,
    unit: 'lb',
    isOrganic: true,
    isLocal: false,
    isSeasonal: false,
    carbonFootprint: 0.6,
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    brand: 'Fair Trade Co',
    imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&h=300&fit=crop'
  },

  // Dairy
  {
    name: 'Organic Greek Yogurt',
    description: 'Creamy organic Greek yogurt',
    category: 'dairy',
    subcategory: 'organic',
    price: 699,
    unit: 'pack',
    isOrganic: true,
    isLocal: false,
    isSeasonal: false,
    carbonFootprint: 1.2,
    calories: 130,
    protein: 23,
    carbs: 9,
    fat: 0,
    brand: 'Organic Valley',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop'
  },
  {
    name: 'Local Farm Eggs',
    description: 'Fresh farm eggs from local chickens',
    category: 'dairy',
    subcategory: 'local',
    price: 599,
    unit: 'dozen',
    isOrganic: false,
    isLocal: true,
    isSeasonal: false,
    carbonFootprint: 0.8,
    calories: 70,
    protein: 6,
    carbs: 0.6,
    fat: 5,
    brand: 'Local Farm Co',
    imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&h=300&fit=crop'
  },
  {
    name: 'Organic Cheddar Cheese',
    description: 'Aged organic cheddar cheese',
    category: 'dairy',
    subcategory: 'organic',
    price: 899,
    unit: 'lb',
    isOrganic: true,
    isLocal: false,
    isSeasonal: false,
    carbonFootprint: 2.1,
    calories: 113,
    protein: 7,
    carbs: 0.4,
    fat: 9,
    brand: 'Organic Valley',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop'
  },

  // Grains
  {
    name: 'Organic Quinoa',
    description: 'Premium organic quinoa',
    category: 'grains',
    subcategory: 'organic',
    price: 899,
    unit: 'lb',
    isOrganic: true,
    isLocal: false,
    isSeasonal: false,
    carbonFootprint: 0.5,
    calories: 120,
    protein: 4.4,
    carbs: 22,
    fat: 1.9,
    brand: 'Organic Valley',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop'
  },
  {
    name: 'Whole Grain Bread',
    description: 'Fresh whole grain artisan bread',
    category: 'grains',
    subcategory: 'artisan',
    price: 499,
    unit: 'loaf',
    isOrganic: false,
    isLocal: true,
    isSeasonal: false,
    carbonFootprint: 0.7,
    calories: 80,
    protein: 3,
    carbs: 15,
    fat: 1,
    brand: 'Local Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop'
  },
  {
    name: 'Organic Brown Rice',
    description: 'Long grain organic brown rice',
    category: 'grains',
    subcategory: 'organic',
    price: 399,
    unit: 'lb',
    isOrganic: true,
    isLocal: false,
    isSeasonal: false,
    carbonFootprint: 0.4,
    calories: 110,
    protein: 2.5,
    carbs: 23,
    fat: 0.9,
    brand: 'Organic Valley',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop'
  },

  // Snacks
  {
    name: 'Organic Almonds',
    description: 'Raw organic almonds',
    category: 'snacks',
    subcategory: 'organic',
    price: 1299,
    unit: 'lb',
    isOrganic: true,
    isLocal: false,
    isSeasonal: false,
    carbonFootprint: 1.8,
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    brand: 'Organic Valley',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
  },
  {
    name: 'Local Honey',
    description: 'Pure local honey from nearby apiaries',
    category: 'snacks',
    subcategory: 'local',
    price: 899,
    unit: 'jar',
    isOrganic: false,
    isLocal: true,
    isSeasonal: false,
    carbonFootprint: 0.3,
    calories: 60,
    protein: 0,
    carbs: 17,
    fat: 0,
    brand: 'Local Farm Co',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop'
  },
  {
    name: 'Organic Dark Chocolate',
    description: '70% organic dark chocolate',
    category: 'snacks',
    subcategory: 'organic',
    price: 699,
    unit: 'bar',
    isOrganic: true,
    isLocal: false,
    isSeasonal: false,
    carbonFootprint: 1.2,
    calories: 150,
    protein: 2,
    carbs: 15,
    fat: 10,
    brand: 'Fair Trade Co',
    imageUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=300&fit=crop'
  }
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()
  console.log('🗑️  Cleared existing data')

  // Create products
  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }
  console.log(`✅ Created ${products.length} products`)

  // Create test user
  const hashedPassword = await bcrypt.hash('test123', 12)
  
  const testUser = await prisma.user.create({
    data: {
      email: 'test@smartgrocer.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      profile: {
        create: {
          householdSize: 2,
          weeklyBudget: 15000, // $150 in cents
          dietaryRestrictions: ['Vegetarian'],
          allergies: ['Nuts'],
          cookingTime: 30,
          mealTypes: ['Quick & Easy', 'Healthy Options'],
          shoppingFrequency: 'weekly',
          preferredDeliveryDay: 'saturday',
          deliveryMethod: 'delivery',
          sustainabilityImportance: 8
        }
      }
    }
  })

  // Create a subscription for the test user
  await prisma.subscription.create({
    data: {
      userId: testUser.id,
      name: 'My Full Box',
      type: 'full',
      frequency: 'weekly',
      nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      maxItems: 25,
      maxBudget: 15000, // $150 in cents
      aiEnabled: true,
      customizationLevel: 'moderate'
    }
  })

  console.log('✅ Created test user account:')
  console.log('   Email: test@smartgrocer.com')
  console.log('   Password: test123')
  console.log('   Subscription: Full Box (weekly)')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 