# FinIQ.ai

**AI Finance Strategy for Startup Founders**

FinIQ.ai is an AI-powered platform that helps startup founders determine the right financial strategy for their business. Get personalized recommendations for funding stage, raise amount, investor types, runway guidance, and budget allocation—all in under 30 seconds.

## 🚀 Features

- **Funding Stage Analysis** - AI recommends the ideal funding stage (Pre-Seed, Seed, Series A+) based on your traction
- **Raise Amount Calculation** - Precise funding recommendations with min-max ranges and reasoning
- **Investor Matching** - Prioritized list of investor types (Angels, Micro-VCs, Traditional VCs, etc.)
- **Runway & Burn Rate** - Detailed runway projections and monthly burn rate guidance  
- **Budget Allocation** - Strategic breakdown of how to allocate funds across Hiring, Product, Marketing, etc.
- **Funding Narrative** - AI-generated compelling story for your fundraise

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **AI**: Google Gemini 1.5 Pro (via LangChain)
- **Caching**: Redis (with mock fallback for development)
- **Deployment**: Vercel-ready

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/finance-copilot.git
cd finance-copilot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables

Create a `.env.local` file with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
REDIS_URL=redis://localhost:6379  # Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🏗️ Project Structure

```
finance-copilot/
├── src/
│   ├── app/
│   │   ├── finance-copilot/          # Main FinIQ.ai page
│   │   └── api/
│   │       └── finance-strategy/     # Finance strategy generation API
│   ├── components/
│   │   ├── FinanceInputForm.tsx      # Multi-field input form
│   │   ├── FinanceStrategyResults.tsx # Strategy display
│   │   └── ui/                       # Reusable UI components
│   ├── lib/
│   │   ├── agents/
│   │   │   └── finance-agents.ts     # 6 AI agents for financial analysis
│   │   └── validation/
│   │       └── finance-inputs.ts     # Input validation logic
│   └── types/
│       └── finance-copilot.ts        # Complete TypeScript type system
└── package.json
```

## 🤖 How It Works

FinIQ.ai uses a **6-agent AI system** powered by Google Gemini:

1. **FundingStageAgent** - Analyzes your startup and recommends funding stage
2. **RaiseAmountCalculator** - Calculates recommended raise amount based on stage and market
3. **InvestorTypeMatcher** - Matches you with ideal investor types  
4. **RunwayBurnRateAdvisor** - Estimates runway and provides burn rate guidance
5. **FinancialPrioritiesAllocator** - Recommends budget allocation across categories
6. **StrategySynthesizer** - Creates narrative, identifies risks, and suggests milestones

All agents run sequentially, passing context to the next agent for a comprehensive strategy.

## 📝 Usage

1. Navigate to `/finance-copilot`
2. Fill out the form with your startup details:
   - Startup name & industry
   - Team size & product stage
   - Monthly revenue & growth rate (optional)
   - Business model & financial concerns
3. Click "Generate Finance Strategy"
4. Review your personalized financial strategy report

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Docker

```bash
# Build
docker build -t finance-copilot .

# Run
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key finance-copilot
```

## 🧪 Development

```bash
# Run dev server
npm run dev

# Run type checking
npm run type-check

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## 📚 API Reference

### POST `/api/finance-strategy`

Generate a financial strategy for a startup.

**Request Body:**
```json
{
  "inputs": {
    "startupName": "MyStartup",
    "industry": "Fintech",
    "targetMarket": "B2B",
    "teamSize": 5,
    "productStage": "MVP",
    "monthlyRevenue": 5000,
    "businessModel": "SaaS subscription",
    "mainFinancialConcern": "Need capital to hire engineers"
  }
}
```

**Response:**
```json
{
  "success": true,
  "strategy": {
    "recommendedStage": { "stage": "Seed", "reasoning": "...", "confidence": 0.85 },
    "raiseAmount": { "recommended": 1500000, "range": { "min": 800000, "max": 2000000 } },
    "investorTypes": [...],
    "runway": {...},
    "priorities": [...],
    "fundingNarrative": "...",
    "keyRisks": [...],
    "nextMilestones": [...]
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

**FinIQ.ai** - AI Finance Strategy for Startup Founders
