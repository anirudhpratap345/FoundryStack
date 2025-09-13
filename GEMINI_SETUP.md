# 🚀 Gemini 2.5 Pro Setup Guide

## Get Your Free Gemini API Key

FoundryStack now uses **Gemini 2.5 Pro** as the primary AI model! It's the latest and most capable model from Google, completely free and very powerful.

### 📋 Step-by-Step Setup

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Choose "Create API key in new project" (recommended)
   - Copy the generated API key

3. **Configure FoundryStack**
   ```bash
   # Edit your .env.local file
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Restart the Server**
   ```bash
   npm run dev
   ```

### 🎯 Why Gemini 2.5 Pro?

- **🆓 Completely Free**: 15 requests per minute, 1M tokens per day
- **🧠 Latest Model**: Most advanced Gemini model available
- **⚡ Fast**: Quick response times
- **🔒 Reliable**: Google's infrastructure
- **📈 No Credit Card**: No payment required
- **🎯 Optimized**: Specifically tuned for complex analysis tasks

### 🧪 Test Your Setup

```bash
# Test the API endpoint
curl -X GET http://localhost:3001/api/test-ai

# Test with a real idea
curl -X POST http://localhost:3001/api/test-ai \
  -H "Content-Type: application/json" \
  -d '{"idea":"A SaaS for small restaurants to manage inventory","title":"Restaurant Inventory SaaS","description":"Help restaurants reduce food waste"}'
```

### 💡 Example Ideas to Try

- "A SaaS platform for small restaurants to manage inventory and reduce food waste"
- "An AI-powered personal finance app that helps millennials save money"
- "A marketplace connecting local farmers directly with consumers"
- "A project management tool specifically designed for remote teams"

### 🎨 What You'll Get

With Gemini, you'll receive:
- **Comprehensive market analysis** with real competitors
- **Detailed technical blueprints** with modern tech stacks
- **4-week implementation plans** with realistic timelines
- **Code templates** and starter repositories

### 🆘 Troubleshooting

**If you get "GEMINI_API_KEY not found":**
1. Make sure you've added the API key to `.env.local`
2. Restart the development server
3. Check that the key is correct (no extra spaces)

**If you get rate limit errors:**
- Gemini allows 15 requests per minute
- Wait a moment and try again
- The app will automatically retry

### 🎉 Ready to Go!

Once you've set up your Gemini API key, your FoundryStack will generate real, AI-powered blueprints for any startup idea you provide!

**Happy coding! 🚀**
