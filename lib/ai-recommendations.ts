import { getCollection } from './db';
import { geminiEngine } from './gemini';

interface UserPreference {
  userId: string;
  category: string;
  itemName: string;
  preference: number;
  frequency: number;
  lastPurchased: Date;
}

interface Rating {
  userId: string;
  productId: string;
  rating: number;
  review?: string;
}

export interface RecommendationItem {
  productId: string;
  name: string;
  category: string;
  price: number;
  confidence: number;
  reason: string;
  imageUrl?: string;
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  aiRecommended?: boolean;
  carbonFootprint?: number;
  recommendationScore?: number;
}

export interface AIRecommendationParams {
  userId: string;
  budget: number;
  maxItems: number;
  dietaryRestrictions: string[];
  allergies: string[];
  sustainabilityImportance: number;
}

export class AIRecommendationEngine {
  constructor() { }

  private async getUserPreferences(userId: string) {
    const Preferences = await getCollection('UserPreference');
    const Ratings = await getCollection('Rating');
    
    const preferences = await Preferences.find({ userId }).sort({ preference: -1 }).toArray() as unknown as UserPreference[];
    const ratings = await Ratings.find({ userId }).toArray() as unknown as Rating[];
    
    return { preferences, ratings, feedback: [] };
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

  private async getCurrentBox(userId: string) {
    const Boxes = await getCollection('Box');
    const box = await Boxes.findOne({ userId } as any);
    return box ? {
      items: (box.items || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        category: item.category
      }))
    } : { items: [] };
  }

  private async getTraditionalRecommendations(
    products: any[],
    preferences: UserPreference[],
    ratings: Rating[],
    sustainabilityImportance: number,
    maxItems: number
  ): Promise<RecommendationItem[]> {
    // Score and rank products
    const scoredProducts = products.map((product) => {
      const { score, reason } = this.calculateProductScore(
        product,
        preferences,
        ratings,
        sustainabilityImportance
      );

      return {
        ...product,
        score,
        reason,
      };
    });

    // Sort by score and take top recommendations
    const topProducts = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems);

    // Convert to recommendation format
    return topProducts.map((product: any) => ({
      productId: String(product.id ?? product._id),
      name: String(product.name),
      category: String(product.category),
      price: Number(product.price),
      confidence: Math.round(Number(product.score) * 100),
      reason: String(product.reason || ''),
      imageUrl: (product.images && product.images[0]?.url) || product.imageUrl,
      images: product.images,
      aiRecommended: false,
    }));
  }

  private combineRecommendations(
    traditional: RecommendationItem[],
    gemini: RecommendationItem[],
    maxItems: number
  ): RecommendationItem[] {
    // Create a map to track products by ID
    const productMap = new Map<string, RecommendationItem>();

    // Add traditional recommendations
    traditional.forEach((rec) => {
      productMap.set(rec.productId, rec);
    });

    // Add or merge Gemini recommendations
    gemini.forEach((rec) => {
      if (productMap.has(rec.productId)) {
        // If product exists in both, merge the reasons and take the higher confidence
        const existing = productMap.get(rec.productId)!;
        productMap.set(rec.productId, {
          ...existing,
          confidence: Math.max(existing.confidence, rec.confidence),
          reason: `${existing.reason}. ${rec.reason}`,
          aiRecommended: true,
        });
      } else {
        productMap.set(rec.productId, rec);
      }
    });

    // Convert back to array and sort by confidence
    return Array.from(productMap.values())
      .filter((rec): rec is RecommendationItem => 
        rec !== null && 
        typeof rec.productId === 'string' &&
        typeof rec.name === 'string' &&
        typeof rec.category === 'string' &&
        typeof rec.price === 'number' &&
        typeof rec.confidence === 'number' &&
        typeof rec.reason === 'string'
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxItems);
  }

  public async generateRecommendations(
    params: AIRecommendationParams
  ): Promise<RecommendationItem[]> {
    const {
      userId,
      budget,
      maxItems,
      dietaryRestrictions,
      allergies,
      sustainabilityImportance,
    } = params;

    // Get user data
    const { preferences, ratings } = await this.getUserPreferences(userId);

    // Get user profile for additional context
    const Profiles = await getCollection('UserProfile');
    const userProfile = await Profiles.findOne({ userId } as any);

    // Get current box
    const currentBox = await this.getCurrentBox(userId);

    // Determine categories based on preferences and dietary restrictions
    const categories = this.getRelevantCategories(preferences, dietaryRestrictions);

    // Get available products
    const availableProducts = await this.getAvailableProducts(categories, budget);

    // Filter out products with allergens
    const safeProducts = availableProducts.filter(
      (product) => !this.containsAllergens(product, allergies)
    );

    // Get recommendations from both traditional algorithm and Gemini
    const [traditionalRecs, geminiRecs] = await Promise.all([
      // Traditional scoring
      this.getTraditionalRecommendations(
        safeProducts,
        preferences,
        ratings,
        sustainabilityImportance,
        maxItems
      ),
      // Gemini-powered recommendations
      (async () => {
        const recs = await geminiEngine.generateRecommendations({
          currentBox,
          userPreferences: {
            dietaryRestrictions,
            allergies,
            sustainabilityImportance,
            weeklyBudget: budget,
          },
          availableProducts: safeProducts.map((product: any) => ({
            id: String(product.id ?? product._id),
            name: String(product.name),
            category: String(product.category),
            price: Number(product.price),
            isOrganic: Boolean(product.isOrganic),
            isLocal: Boolean(product.isLocal),
            description: String(product.description || '')
          })),
        });
        // Filter out nulls and ensure all required fields exist
        const validRecs = recs.filter((rec): rec is NonNullable<typeof rec> => 
          rec !== null &&
          typeof rec === 'object' &&
          'productId' in rec &&
          'name' in rec &&
          'category' in rec &&
          'price' in rec &&
          'confidence' in rec &&
          'reason' in rec
        );
        
        // Map to RecommendationItem type
        return validRecs.map(rec => ({
          productId: rec.productId,
          name: rec.name,
          category: rec.category,
          price: rec.price,
          confidence: rec.confidence,
          reason: rec.reason,
          imageUrl: undefined,
          images: [],
          aiRecommended: true,
          carbonFootprint: 0,
          recommendationScore: rec.confidence
        }));
      })(),
    ]);

    // Combine and deduplicate recommendations
    const combinedRecs = this.combineRecommendations(
      traditionalRecs,
      geminiRecs,
      maxItems
    );

    return combinedRecs;
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