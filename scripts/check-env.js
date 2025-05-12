#!/usr/bin/env node

/**
 * Script to check if Supabase environment variables are correctly set in .env.local
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.resolve(process.cwd(), '.env.local');

// Function to load environment variables from .env.local
function loadEnvVars() {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        
        process.env[key] = value;
      }
    });
  }
}

// Load environment variables from .env.local
loadEnvVars();

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.log('\x1b[33m%s\x1b[0m', 'Warning: .env.local file not found!');
  console.log('Creating .env.local file with template values...');
  
  // Create a template .env.local file
  const template = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Other environment variables
`;

  fs.writeFileSync(envPath, template, 'utf8');
  console.log('\x1b[32m%s\x1b[0m', '.env.local file created with template values.');
  console.log('\x1b[31m%s\x1b[0m', 'Important: You must fill in the actual values before running the app!');
  process.exit(1);
}

// Read and check .env.local file
const env = fs.readFileSync(envPath, 'utf8');
const lines = env.split('\n');

let hasSupabaseUrl = false;
let supabaseUrl = '';
let hasSupabaseAnonKey = false;
let supabaseAnonKey = '';
let isValidAnonKeyFormat = false;

// Check for required variables
for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=') && !line.includes('your_supabase_url_here')) {
    hasSupabaseUrl = true;
    supabaseUrl = line.replace('NEXT_PUBLIC_SUPABASE_URL=', '').trim();
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && !line.includes('your_supabase_anon_key_here')) {
    hasSupabaseAnonKey = true;
    supabaseAnonKey = line.replace('NEXT_PUBLIC_SUPABASE_ANON_KEY=', '').trim();
    
    // Basic validation of anon key format (should be a JWT token starting with "ey")
    if (supabaseAnonKey && supabaseAnonKey.startsWith('ey') && supabaseAnonKey.length > 30) {
      isValidAnonKeyFormat = true;
    }
  }
}

// Display results
console.log('\n--- Supabase Environment Variables Check ---');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? '\x1b[32mOK\x1b[0m' : '\x1b[31mMISSING\x1b[0m'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasSupabaseAnonKey ? '\x1b[32mOK\x1b[0m' : '\x1b[31mMISSING\x1b[0m'}`);

if (hasSupabaseAnonKey) {
  console.log(`ANON_KEY Format: ${isValidAnonKeyFormat ? '\x1b[32mVALID\x1b[0m' : '\x1b[31mINVALID\x1b[0m'}`);
  if (!isValidAnonKeyFormat) {
    console.log('\x1b[33m%s\x1b[0m', '  The ANON_KEY does not match the expected format (JWT token starting with "ey")');
    console.log('  Please check that you copied the correct anon/public key from your Supabase dashboard.');
  }
}

if (!hasSupabaseUrl || !hasSupabaseAnonKey) {
  console.log('\n\x1b[31m%s\x1b[0m', 'Error: Required Supabase environment variables are missing!');
  console.log('\x1b[33m%s\x1b[0m', 'Please update your .env.local file with the correct values from your Supabase project settings.');
  console.log('You can find these values in your Supabase dashboard under Project Settings > API.');
  process.exit(1);
} else if (!isValidAnonKeyFormat) {
  console.log('\n\x1b[33m%s\x1b[0m', 'Warning: ANON_KEY format is suspicious!');
  console.log('Please verify your ANON_KEY from Supabase dashboard (Project Settings > API > Project API Keys)');
  console.log('The ANON_KEY should match the "anon" "public" key, NOT the service_role key.');
} else {
  console.log('\n\x1b[32m%s\x1b[0m', 'All Supabase environment variables are correctly set!');
  console.log('\n\x1b[33m%s\x1b[0m', 'REMINDER: Make sure your ANON_KEY matches exactly with the key shown in your Supabase dashboard.');
}

// Prompt for testing the connection
console.log('\nTo test your Supabase connection, run:');
console.log('\x1b[36m%s\x1b[0m', 'npm run dev');
console.log('Then visit: http://localhost:3000/api/admin/check-supabase-config');

// 환경 변수 확인 스크립트
console.log('\n======= 환경 변수 확인 =======');

// Gemini API 키 확인
const geminiApiKey = process.env.GEMINI_API_KEY;
const publicGeminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

console.log('GEMINI_API_KEY 설정 여부:', !!geminiApiKey);
if (geminiApiKey) {
  console.log('GEMINI_API_KEY 형식 확인:', geminiApiKey.length > 10 ? '유효함' : '유효하지 않음');
  console.log('GEMINI_API_KEY 첫 4자:', geminiApiKey.substring(0, 4) + '...');
}

console.log('NEXT_PUBLIC_GEMINI_API_KEY 설정 여부:', !!publicGeminiApiKey);
if (publicGeminiApiKey) {
  console.log('NEXT_PUBLIC_GEMINI_API_KEY 형식 확인:', publicGeminiApiKey.length > 10 ? '유효함' : '유효하지 않음');
  console.log('NEXT_PUBLIC_GEMINI_API_KEY 첫 4자:', publicGeminiApiKey.substring(0, 4) + '...');
}

// 환경 변수가 설정되지 않은 경우 경고
if (!geminiApiKey && !publicGeminiApiKey) {
  console.error('\n⚠️  경고: Gemini API 키가 설정되지 않았습니다!');
  console.error('Gemini API를 사용하려면 .env.local 파일에 GEMINI_API_KEY를 설정하세요.');
  console.error('설정 방법은 SETUP_GEMINI.md 파일을 참고하세요.\n');
}

console.log('==============================\n'); 