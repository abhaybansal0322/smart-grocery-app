# SmartGrocer - AI-Powered Grocery Subscription App

A comprehensive smart grocery subscription service that uses AI to learn user preferences and deliver personalized grocery boxes.

## 🚀 Features Implemented

### 1. **AI-Driven Preferences**
- Smart system learns user food habits and dietary needs over time
- Personalized recommendations based on purchase history and ratings
- Dietary restriction and allergy filtering
- Sustainability preferences integration

### 2. **Weekly Customization**
- Automatically generated shopping lists based on lifestyle
- Seasonal ingredient suggestions
- Recipe recommendations
- Budget-aware recommendations

### 3. **Subscription Flexibility**
- Multiple subscription types: Full, Fruits, Vegetables, Proteins, Snacks, Household
- Flexible delivery frequencies: Weekly, Bi-weekly, Monthly
- Customizable box sizes and budgets
- AI customization levels: Minimal, Moderate, Full

### 4. **Delivery & Pickup Options**
- Home delivery and in-store pickup options
- Local store integration for fresh produce
- Flexible delivery scheduling

### 5. **Sustainability Focus**
- Carbon footprint tracking
- Local sourcing preferences
- Organic product prioritization
- Waste reduction metrics
- Eco-friendly packaging options

## 🛠️ Technical Stack

- **Frontend**: Next.js 13 with TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT with bcrypt
- **AI**: Custom recommendation engine

## 📁 Project Structure

```
smart-grocery-app/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── recommendations/   # AI recommendations
│   │   ├── subscriptions/     # Subscription management
│   │   └── user/              # User profile management
│   ├── dashboard/             # User dashboard
│   ├── onboarding/            # User onboarding flow
│   └── page.tsx               # Landing page
├── components/                # Reusable UI components
├── lib/                       # Utilities and configurations
│   ├── auth.ts               # Authentication utilities
│   ├── auth-context.tsx      # React auth context
│   ├── ai-recommendations.ts # AI recommendation engine
│   └── db.ts                 # Database connection
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
└── hooks/                    # Custom React hooks
```

## 🗄️ Database Schema

The app includes comprehensive data models for:

- **Users & Profiles**: Account management and preferences
- **Products**: Inventory with sustainability metrics
- **Subscriptions**: Flexible subscription management
- **Orders**: Order tracking and history
- **AI Learning**: User preferences and ratings
- **Sustainability**: Environmental impact tracking
- **Recipes**: Meal planning and suggestions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-grocery-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🧪 Testing the App

### 1. **User Registration**
- Visit the homepage and click "Get Started"
- Complete the onboarding flow with your preferences
- The system will create your account and profile

### 2. **Dashboard Experience**
- View AI-generated recommendations
- See your subscription details
- Track sustainability metrics
- Manage preferences

### 3. **AI Learning**
- Rate products to improve recommendations
- Provide feedback on deliveries
- Watch the AI adapt to your preferences

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/user/profile` - Get user profile

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Create new subscription

### AI Recommendations
- `GET /api/recommendations` - Get personalized recommendations

## 🌱 AI Recommendation Engine

The custom AI engine considers:
- **User Preferences**: Historical ratings and feedback
- **Dietary Restrictions**: Allergies and dietary needs
- **Sustainability**: Carbon footprint and local sourcing
- **Budget**: Price sensitivity and spending patterns
- **Seasonality**: Fresh and seasonal products
- **Frequency**: How often users buy specific items

## 📊 Sustainability Features

- **Carbon Footprint Tracking**: Each product includes CO2 impact
- **Local Sourcing**: Prioritizes local products when available
- **Organic Options**: Highlights organic and sustainable choices
- **Waste Reduction**: Tracks and reports on food waste reduction
- **Packaging Score**: Evaluates packaging sustainability

## 🔮 Future Enhancements

- **Recipe Integration**: AI-generated meal plans
- **Inventory Management**: Real-time stock tracking
- **Delivery Optimization**: Route optimization for deliveries
- **Mobile App**: Native mobile application
- **Payment Integration**: Stripe/PayPal integration
- **Analytics Dashboard**: Advanced user analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**SmartGrocer** - Making grocery shopping smarter, more sustainable, and personalized with AI. 