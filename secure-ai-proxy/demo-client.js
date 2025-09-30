// demo-client.js - Interactive demo client to test the secure proxy
// To Run : nodemon demo-client.js --interactive
require('dotenv').config();

const axios = require('axios');
const readline = require('readline');

const port = process.env.PORT
const BASE_URL = 'http://localhost:'+port;
console.log(BASE_URL)
let authToken = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
    console.log(`${BASE_URL}${endpoint}`)
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Demo functions
const login = async () => {
  console.log('\n🔐 Logging in...');
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      username: 'demo',
      password: 'password123'
    });
    
    authToken = response.token;
    console.log('✅ Login successful!');
    console.log(`Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error);
    return false;
  }
};

const testOpenAI = async () => {
  console.log('\n🤖 Testing OpenAI proxy...');
  
  const prompts = [
    'Hello, my email is john.doe@example.com. How are you today?',
    'My phone number is 555-123-4567 and my SSN is 123-45-6789. Can you help me?',
    'I have a credit card 4532-1234-5678-9012. What can I do with AI?'
  ];
  
  for (const prompt of prompts) {
    try {
      console.log(`\n📝 Prompt: "${prompt.substring(0, 50)}..."`);
      
      const response = await makeRequest('POST', '/api/openai/chat', {
        prompt,
        model: 'gpt-3.5-turbo',
        max_tokens: 100
      });
      
      console.log('✅ Response received');
      console.log('📊 Metadata:', response.metadata);
      console.log('🔒 PII Scrubbed:', response.metadata.scrubbed);
      console.log('💬 AI Response:', response.data.choices[0].message.content);
      
    } catch (error) {
      console.error('❌ OpenAI request failed:', error);
    }
  }
};

const testHuggingFace = async () => {
  console.log('\n🤗 Testing Hugging Face proxy...');
  
  const texts = [
    'This is amazing! My email is jane@example.com',
    'I love this product, but my phone 555-987-6543 keeps ringing',
    'Great service! Credit card 4111-1111-1111-1111 charged successfully'
  ];
  
  for (const text of texts) {
    try {
      console.log(`\n📝 Text: "${text.substring(0, 50)}..."`);
      
      const response = await makeRequest('POST', '/api/huggingface/analyze', {
        text,
        model: 'distilbert-base-uncased'
      });
      
      console.log('✅ Analysis complete');
      console.log('📊 Metadata:', response.metadata);
      console.log('🔒 PII Scrubbed:', response.metadata.scrubbed);
      console.log('📈 Prediction:', response.data.predictions[0]);
      
    } catch (error) {
      console.error('❌ Hugging Face request failed:', error);
    }
  }
};

const testRateLimit = async () => {
  console.log('\n⏱️ Testing rate limits...');
  console.log('Making 15 rapid requests to trigger rate limiting...');
  
  const promises = [];
  for (let i = 0; i < 15; i++) {
    promises.push(
      makeRequest('POST', '/api/openai/chat', {
        prompt: `Test request ${i + 1}`,
      }).catch(error => ({
        error: true,
        message: error.error || error,
        requestNumber: i + 1
      }))
    );
  }
  
  const results = await Promise.all(promises);
  
  let successful = 0;
  let rateLimited = 0;
  
  results.forEach((result, index) => {
    if (result.error) {
      console.log(`Request ${index + 1}: ❌ ${result.message}`);
      if (result.message.includes('limit')) {
        rateLimited++;
      }
    } else {
      console.log(`Request ${index + 1}: ✅ Success`);
      successful++;
    }
  });
  
  console.log(`\n📊 Results: ${successful} successful, ${rateLimited} rate limited`);
};

const showMenu = () => {
  console.log(`
🎯 Secure AI Proxy Demo Client

Available Commands:
1. login        - Authenticate with the server
2. openai       - Test OpenAI proxy with PII scrubbing
3. huggingface  - Test Hugging Face proxy with PII scrubbing
4. ratelimit    - Test rate limiting functionality
5. health       - Check server health
6. audit        - View audit information
7. help         - Show this menu
8. exit         - Exit the demo

Current Status: ${authToken ? '🟢 Authenticated' : '🔴 Not authenticated'}
  `);
};

const handleCommand = async (command) => {
  switch (command.toLowerCase()) {
    case '1':
    case 'login':
      await login();
      break;
      
    case '2':
    case 'openai':
      if (!authToken) {
        console.log('❌ Please login first');
        break;
      }
      await testOpenAI();
      break;
      
    case '3':
    case 'huggingface':
      if (!authToken) {
        console.log('❌ Please login first');
        break;
      }
      await testHuggingFace();
      break;
      
    case '4':
    case 'ratelimit':
      if (!authToken) {
        console.log('❌ Please login first');
        break;
      }
      await testRateLimit();
      break;
      
    case '5':
    case 'health':
      try {
        const response = await makeRequest('GET', '/health');
        console.log('✅ Server is healthy:', response);
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
      break;
      
    case '6':
    case 'audit':
      if (!authToken) {
        console.log('❌ Please login first');
        break;
      }
      try {
        const response = await makeRequest('GET', '/api/admin/audit');
        console.log('📋 Audit info:', response);
        console.log('💡 Check server logs for detailed audit trails');
      } catch (error) {
        console.error('❌ Audit request failed:', error);
      }
      break;
      
    case '7':
    case 'help':
      showMenu();
      break;
      
    case '8':
    case 'exit':
      console.log('👋 Goodbye!');
      rl.close();
      process.exit(0);
      break;
      
    default:
      console.log('❓ Unknown command. Type "help" for available commands.');
  }
};

const startDemo = async () => {
  console.log('🚀 Starting Secure AI Proxy Demo Client');
  console.log('Make sure the server is running on http://localhost:3001');
  
  // Check if server is running
  try {
    await makeRequest('GET', '/health');
    console.log('✅ Server connection successful');
  } catch (error) {
    console.error('❌ Cannot connect to server. Please start the server first.');
    console.error('Run: npm start');
    process.exit(1);
  }
  
  showMenu();
  
  const askForCommand = () => {
    rl.question('\n💭 Enter command: ', async (command) => {
      await handleCommand(command);
      askForCommand();
    });
  };
  
  askForCommand();
};

// Auto-run demo scenarios
const runAutoDemo = async () => {
  console.log('🎬 Running automatic demo...\n');
  
  console.log('Step 1: Health Check');
  try {
    const health = await makeRequest('GET', '/health');
    console.log('✅ Server healthy:', health.status);
  } catch (error) {
    console.error('❌ Server not available');
    console.log(error)
    return;
  }
  
  console.log('\nStep 2: Authentication');
  const loginSuccess = await login();
  if (!loginSuccess) return;
  
  console.log('\nStep 3: OpenAI with PII Scrubbing Demo');
  await testOpenAI();
  
  console.log('\nStep 4: Hugging Face with PII Scrubbing Demo');
  await testHuggingFace();
  
  console.log('\nStep 5: Rate Limiting Demo');
  await testRateLimit();
  
  console.log('\n🎉 Auto demo complete! Check server logs for audit trails.');
  console.log('💡 Run with --interactive flag for interactive mode');
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--interactive') || args.includes('-i')) {
  startDemo();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Secure AI Proxy Demo Client

Usage:
  node demo-client.js [options]

Options:
  --interactive, -i    Run in interactive mode
  --help, -h          Show this help message
  
  (no options)        Run automatic demo

Examples:
  node demo-client.js                 # Run automatic demo
  node demo-client.js --interactive   # Run interactive mode
  `);
} else {
  runAutoDemo();
}

module.exports = { login, testOpenAI, testHuggingFace, testRateLimit };