import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface GeminiRecommendationParams {
  currentBox: {
    items: Array<{
      name: string;
      quantity: number;
      category: string;
    }>;
  };
  userPreferences: {
    dietaryRestrictions: string[];
    allergies: string[];
    sustainabilityImportance: number;
    weeklyBudget: number;
  };
  availableProducts: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    isOrganic: boolean;
    isLocal: boolean;
    description: string;
  }>;
}

export class GeminiRecommendationEngine {
  private readonly model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    }
  });

  public async generateRecommendations({
    currentBox,
    userPreferences,
    availableProducts,
  }: GeminiRecommendationParams) {
    try {
      // Create a prompt for Gemini
      const prompt = this.createRecommendationPrompt(
        currentBox,
        userPreferences,
        availableProducts
      );

      let text: string;
      try {
        // Generate recommendations using Gemini
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        // Fallback to basic recommendations
        return availableProducts.slice(0, 5).map(product => ({
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          confidence: 0.5,
          reason: "Basic recommendation (Gemini API unavailable)",
          imageUrl: undefined,
          images: [],
          aiRecommended: false,
          carbonFootprint: 0
        }));
      }

      // Parse Gemini's response
      return this.parseGeminiResponse(text, availableProducts);
    } catch (error) {
      console.error('Gemini recommendation error:', error);
      throw error;
    }
  }

  private createRecommendationPrompt(
    currentBox: GeminiRecommendationParams['currentBox'],
    userPreferences: GeminiRecommendationParams['userPreferences'],
    availableProducts: GeminiRecommendationParams['availableProducts']
  ): string {
    return `
As a smart grocery recommendation system, analyze the following information and suggest products:

Current Box Contents:
${currentBox.items
  .map((item) => `- ${item.quantity}x ${item.name} (${item.category})`)
  .join('\n')}

User Preferences:
- Dietary Restrictions: ${userPreferences.dietaryRestrictions.join(', ')}
- Allergies: ${userPreferences.allergies.join(', ')}
- Sustainability Importance: ${userPreferences.sustainabilityImportance}/10
- Weekly Budget: $${userPreferences.weeklyBudget / 100}

Available Products (showing first 10 for context):
${availableProducts
  .slice(0, 10)
  .map(
    (product) =>
      `- ${product.name} (${product.category}) - $${
        product.price / 100
      } - ${product.isOrganic ? 'Organic' : 'Non-organic'}${
        product.isLocal ? ', Local' : ''
      }`
  )
  .join('\n')}

Based on this information, recommend 5 products that would complement the current box while:
1. Respecting dietary restrictions and allergies
2. Staying within budget
3. Matching sustainability preferences
4. Creating a balanced meal plan

Format your response as a JSON array of objects with properties:
- productId: string
- reason: string (why this product is recommended)
- confidence: number (0-1, how confident you are in this recommendation)
`;
  }

  private parseGeminiResponse(
    response: string,
    availableProducts: GeminiRecommendationParams['availableProducts']
  ) {
    try {
      // Extract JSON from response using a more robust method
      const jsonStart = response.indexOf('[');
      const jsonEnd = response.lastIndexOf(']');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error('No JSON array found in response:', response);
        return [];
      }

      const jsonStr = response.slice(jsonStart, jsonEnd + 1);
      let recommendations: Array<{ productId: string; reason: string; confidence: number }>;
      
      try {
        recommendations = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        return [];
      }

      if (!Array.isArray(recommendations)) {
        console.error('Parsed result is not an array:', recommendations);
        return [];
      }

      // Map recommendations to products with type validation
      return recommendations
        .filter(rec => typeof rec === 'object' && rec !== null)
        .map(rec => {
          const product = availableProducts.find((p) => p.id === rec.productId);
          if (!product) {
            console.warn(`Product not found for ID: ${rec.productId}`);
            return null;
          }

        return {
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          reason: rec.reason,
          confidence: rec.confidence,
          imageUrl: undefined,
          images: [],
          aiRecommended: true,
          carbonFootprint: 0,
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return [];
    }
  }
}

export const geminiEngine = new GeminiRecommendationEngine();