// Simple test script for AI generation
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDVE-4WvaE-D4wsmt-UvdER2gUs1nAt7gw';
    console.log('API Key found:', apiKey ? 'Yes' : 'No');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });

    const prompt = "Generate a simple JSON response for a startup idea: 'AI-powered fitness app'";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('AI Response:', text);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGemini();
