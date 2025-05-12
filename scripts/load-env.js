#!/usr/bin/env node

/**
 * This script explicitly loads environment variables from .env.local
 * It's used before starting the Next.js application
 */

const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  console.log('Loading environment variables from:', envPath);
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.error('Error loading .env.local file:', result.error);
    process.exit(1);
  }
  
  // Verify Gemini API keys are loaded
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const publicGeminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  console.log('GEMINI_API_KEY loaded:', !!geminiApiKey);
  console.log('NEXT_PUBLIC_GEMINI_API_KEY loaded:', !!publicGeminiApiKey);
  
  if (geminiApiKey) {
    console.log('GEMINI_API_KEY starts with:', geminiApiKey.substring(0, 4) + '...');
  }
  
  if (!geminiApiKey || !publicGeminiApiKey) {
    console.warn('WARNING: One or more Gemini API keys not found in environment');
  }
} else {
  console.error('ERROR: .env.local file not found at:', envPath);
  console.error('Please create this file with your environment variables');
  process.exit(1);
} 