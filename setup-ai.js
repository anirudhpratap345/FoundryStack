#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 FoundryStack AI Setup\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# AI Provider Configuration
# Using Gemini 2.5 Pro (Free tier - 15 requests/minute, 1M tokens/day)
# Get your free API key at: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration (for future use)
DATABASE_URL=postgresql://username:password@localhost:5432/foundry_stack

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local file already exists');
}

console.log('\n🎯 AI Configuration:');
console.log('✅ Using Gemini 2.5 Pro - Latest and most capable model');
console.log('🆓 Free tier: 15 requests/minute, 1M tokens/day');
console.log('🔄 Fallback: Mock provider if no API key');

console.log('\n📋 Next Steps:');
console.log('1. Get free Gemini API key at https://makersuite.google.com/app/apikey');
console.log('2. Add your API key to .env.local: GEMINI_API_KEY=your_key_here');
console.log('3. Run: npm run dev');
console.log('4. Test at: http://localhost:3001/api/test-ai');

console.log('\n🧪 Test your setup:');
console.log('curl -X GET http://localhost:3001/api/test-ai');
console.log('\nHappy coding! 🎉');
