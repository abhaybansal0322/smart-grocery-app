import { getCollection } from './db'

export interface RecommendationItem {
  productId: string
  name: string
  category: string
  price: number
  confidence: number
  reason: string
  imageUrl?: string
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>
}

export interface AIRecommendationParams {
  userId: string
  budget: number
  maxItems: number
  dietaryRestrictions: string[]
  allergies: string[]
  sustainabilityImportance: number
}

export class AIRecommendationEngine {
  private async getUserPreferences(userId: string) {
    const Preferences = await getCollection('UserPreference')
    const Ratings = await getCollection('Rating')
    const preferences = await Preferences.find({ userId } as any).sort({ preference: -1 }).toArray()
    const ratings = await Ratings.find({ userId } as any).toArray()
    return { preferences, ratings, feedback: [] }
  }

  private calculateProductScore(
    product: any,
    userPreferences: any[],
    ratings: any[],
    sustainabilityImportance: number
  ): { score: number; reason: string } {
    let score = 0.5 // Base score
    let reasons: string[] = []

    // Check user preferences
    const preference = userPreferences.find(p => 
      p.category === product.category && p.itemName.toLowerCase().includes(product.name.toLowerCase())
    )
    
    if (preference) {
      score += preference.preference * 0.3
      reasons.push(`Based on your preferences`)
    }

    // Check ratings
    const userRating = ratings.find(r => r.productId === product.id)
    if (userRating) {
      score += (userRating.rating / 5) * 0.2
      reasons.push(`You rated this ${userRating.rating}/5`)
    }

    // Check sustainability
    if (product.isOrganic && sustainabilityImportance > 5) {
      score += 0.1
      reasons.push('Organic option')
    }
    
    if (product.isLocal && sustainabilityImportance > 5) {
      score += 0.1
      reasons.push('Locally sourced')
    }

    // Seasonal bonus
    if (product.isSeasonal) {
      score += 0.05
      reasons.push('Seasonal item')
    }

    // Price sensitivity (lower price = higher score for budget-conscious users)
    const priceScore = Math.max(0, 1 - (product.price / 1000)) // Normalize price
    score += priceScore * 0.1

    return {
      score: Math.min(1, Math.max(0, score)),
      reason: reasons.join(', ')
    }
  }

  private async getAvailableProducts(categories: string[], budget: number) {
    const Products = await getCollection('Product')
    return await Products.find({
      inStock: true,
      price: { $lte: budget },
      category: { $in: categories }
    } as any).sort({ createdAt: -1 }).toArray()
  }

  public async generateRecommendations(params: AIRecommendationParams): Promise<RecommendationItem[]> {
    const { userId, budget, maxItems, dietaryRestrictions, allergies, sustainabilityImportance } = params

    // Get user data
    const { preferences, ratings } = await this.getUserPreferences(userId)
    
    // Get user profile for additional context
    const Profiles = await getCollection('UserProfile')
    const userProfile = await Profiles.findOne({ userId } as any)

    // Determine categories based on preferences and dietary restrictions
    const categories = this.getRelevantCategories(preferences, dietaryRestrictions)
    
    // Get available products
    const availableProducts = await this.getAvailableProducts(categories, budget)

    // Filter out products with allergens
    const safeProducts = availableProducts.filter(product => 
      !this.containsAllergens(product, allergies)
    )

    // Score and rank products
    const scoredProducts = safeProducts.map(product => {
      const { score, reason } = this.calculateProductScore(
        product, 
        preferences, 
        ratings, 
        sustainabilityImportance
      )
      
      return {
        ...product,
        score,
        reason
      }
    })

    // Sort by score and take top recommendations
    const topProducts = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems)

    // Convert to recommendation format
    const recommendations: RecommendationItem[] = topProducts.map((product: any) => ({
      productId: String(product.id ?? product._id),
      name: String(product.name),
      category: String(product.category),
      price: Number(product.price),
      confidence: Math.round(Number(product.score) * 100),
      reason: String(product.reason || ''),
      imageUrl: (product.images && product.images[0]?.url) || product.imageUrl,
      images: product.images
    }))

    return recommendations
  }

  private getRelevantCategories(preferences: any[], dietaryRestrictions: string[]): string[] {
    const baseCategories = ['proteins', 'vegetables', 'fruits', 'dairy', 'grains', 'snacks']
    
    // If user has preferences, prioritize those categories
    if (preferences.length > 0) {
      const preferredCategories = preferences.reduce<string[]>((acc, p: any) => {
        const cat = String(p.category)
        if (acc.indexOf(cat) === -1) acc.push(cat)
        return acc
      }, [])
      return [...preferredCategories, ...baseCategories.filter(c => preferredCategories.indexOf(c) === -1)]
    }

    return baseCategories
  }

  private containsAllergens(product: any, allergies: string[]): boolean {
    if (allergies.length === 0) return false
    
    const productName = product.name.toLowerCase()
    const productDescription = (product.description || '').toLowerCase()
    
    return allergies.some(allergy => {
      const allergyLower = allergy.toLowerCase()
      return productName.includes(allergyLower) || productDescription.includes(allergyLower)
    })
  }

  public async updateUserPreferences(
    userId: string, 
    productId: string, 
    rating: number,
    feedback?: string
  ) {
    const Products = await getCollection('Product')
    const product = await Products.findOne({ id: productId } as any)

    if (!product) return

    // Update or create user preference
    const Preferences = await getCollection('UserPreference')
    const existingPreference = await Preferences.findOne({ userId, category: (product as any).category, itemName: (product as any).name } as any)

    if (existingPreference) {
      // Update existing preference based on rating
      const newPreference = Math.max(0, Math.min(1, rating / 5))
      await Preferences.updateOne(
        { id: existingPreference.id } as any,
        { $set: { preference: newPreference, frequency: existingPreference.frequency + 1, lastPurchased: new Date() } }
      )
    } else {
      // Create new preference
      await Preferences.insertOne({
        userId,
        category: (product as any).category,
        itemName: (product as any).name,
        preference: rating / 5,
        frequency: 1,
        lastPurchased: new Date()
      } as any)
    }

    // Update or create rating
    const Ratings = await getCollection('Rating')
    await Ratings.updateOne(
      { userId, productId } as any,
      { $set: { rating, review: feedback } },
      { upsert: true }
    )
  }
}

export const aiEngine = new AIRecommendationEngine() 