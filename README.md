# FoundryStack

Transform startup ideas into end-to-end blueprints and 4-week implementation plans with AI-powered analysis and orchestration.

## 🚀 What We've Built

This is the MVP frontend mockup for FoundryStack, built with the tech stack decisions outlined in the project requirements.

### ✅ Completed Features

- **Modern Frontend**: Next.js 14 with App Router, Tailwind CSS, and shadcn/ui components
- **GraphQL API**: GraphQL Yoga server with comprehensive schema for blueprints
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Blueprint Management**: Create, view, and manage startup blueprints
- **Mock Data**: Sample blueprints with realistic market analysis and technical details

### 🎯 Key Pages

1. **Home Page** (`/`) - Main landing page with idea input form
2. **Blueprints Dashboard** (`/blueprints`) - View all created blueprints
3. **Blueprint Detail** (`/blueprints/[id]`) - Detailed view of individual blueprints

### 🛠 Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **API**: GraphQL Yoga with comprehensive schema
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)

### 🏗 Project Structure

```
src/
├── app/
│   ├── api/graphql/          # GraphQL API endpoint
│   ├── blueprints/           # Blueprint pages
│   ├── globals.css           # Global styles and design system
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/ui/            # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── textarea.tsx
└── lib/
    ├── graphql/              # GraphQL schema and resolvers
    │   ├── schema.ts
    │   ├── resolvers.ts
    │   └── client.ts
    └── utils.ts              # Utility functions
```

### 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🎨 Design System

The app uses a comprehensive design system with:
- **Colors**: HSL-based color tokens with dark mode support
- **Typography**: Geist Sans and Geist Mono fonts
- **Components**: Consistent, accessible UI components
- **Spacing**: Tailwind's spacing scale
- **Shadows**: Subtle elevation system

### 📊 GraphQL Schema

The GraphQL API includes comprehensive types for:
- **Blueprints**: Main entity with status tracking
- **Market Analysis**: Target market, competition, positioning
- **Technical Blueprint**: Architecture, tech stack, API design
- **Implementation Plan**: Sprints, tasks, milestones, deliverables
- **Code Templates**: Starter repositories and boilerplate code

### 🔄 Next Steps

The frontend mockup is complete and ready for backend integration:

1. **Python FastAPI Service**: Orchestration and LLM integration
2. **Database Setup**: PostgreSQL with Supabase
3. **Vector Search**: Qdrant for pattern matching
4. **LLM Integration**: OpenAI GPT-4 API calls
5. **Real-time Updates**: WebSocket connections for blueprint generation progress

### 🎯 Key Features Demonstrated

- ✅ **Idea Input**: Users can describe their startup ideas
- ✅ **Blueprint Creation**: GraphQL mutation creates new blueprints
- ✅ **Dashboard View**: List all blueprints with status indicators
- ✅ **Detailed View**: Comprehensive blueprint analysis display
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Dark Mode**: Automatic dark/light theme switching
- ✅ **Loading States**: Proper loading indicators and error handling

### 🚀 Ready for Backend Integration

The frontend is fully prepared for backend integration with:
- GraphQL client ready for real API calls
- Error handling and loading states
- Type-safe interfaces for all data structures
- Responsive design that will work with real data

This mockup demonstrates the complete user experience and provides a solid foundation for building the full FoundryStack application.