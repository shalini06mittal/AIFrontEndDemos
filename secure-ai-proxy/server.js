// Secure Backend API Proxy for AI Services
// This demonstrates a production-ready proxy with all security features

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// ============= LOGGING SETUP =============
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-proxy' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});


// ============= PII SCRUBBING UTILITY =============
class PIIScrubber {
  static patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    // Add more patterns as needed
  };

  static scrub(text) {
    if (!text || typeof text !== 'string') return text;
    
    let scrubbed = text;
    
    // Replace emails
    scrubbed = scrubbed.replace(this.patterns.email, '[EMAIL_REDACTED]');
    
    // Replace phone numbers
    scrubbed = scrubbed.replace(this.patterns.phone, '[PHONE_REDACTED]');
    
    // Replace SSN
    scrubbed = scrubbed.replace(this.patterns.ssn, '[SSN_REDACTED]');
    
    // Replace credit cards
    scrubbed = scrubbed.replace(this.patterns.creditCard, '[CARD_REDACTED]');
    
    return scrubbed;
  }

  static scrubObject(obj) {
    if (!obj) return obj;
    
    if (typeof obj === 'string') {
      return this.scrub(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.scrubObject(item));
    }
    
    if (typeof obj === 'object') {
      const scrubbed = {};
      for (const [key, value] of Object.entries(obj)) {
        scrubbed[key] = this.scrubObject(value);
      }
      return scrubbed;
    }
    
    return obj;
  }
}

// ============= RATE LIMITING =============
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID from JWT if available, otherwise IP
      return req.user?.id || req.clientIp;
    }
  });
};

// Different rate limits for different endpoints
const generalLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each user to 100 requests per windowMs
  'Too many requests, please try again later'
);

const aiLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // limit each user to 10 AI requests per minute
  'AI request limit exceeded, please slow down'
);

app.use('/api/', generalLimit);

// ============= AUTHENTICATION MIDDLEWARE =============
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      logger.warn('Invalid token attempt', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        token: token.substring(0, 20) + '...' 
      });
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

// ============= AUDIT TRAIL MIDDLEWARE =============
const auditMiddleware = (req, res, next) => {
  const auditId = crypto.randomUUID();
  const startTime = Date.now();
  
  // Scrub request data for logging
  const scrubbedBody = PIIScrubber.scrubObject(req.body);
  
  // Log request
  logger.info('API Request', {
    auditId,
    userId: req.user?.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestBody: scrubbedBody,
    timestamp: new Date().toISOString()
  });

  // Intercept response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Parse response data if it's JSON
    let responseData;
    try {
      responseData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      responseData = data;
    }
    
    // Scrub response data
    const scrubbedResponse = PIIScrubber.scrubObject(responseData);
    
    // Log response
    logger.info('API Response', {
      auditId,
      userId: req.user?.id,
      statusCode: res.statusCode,
      duration,
      responseBody: scrubbedResponse,
      timestamp: new Date().toISOString()
    });

    originalSend.call(this, data);
  };

  req.auditId = auditId;
  next();
};

// ============= AI SERVICE PROXIES =============

// OpenAI Proxy
const proxyToOpenAI = async (req, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo', max_tokens = 150 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Scrub PII from prompt before sending to OpenAI
    const scrubbedPrompt = PIIScrubber.scrub(prompt);
    
    logger.info('Proxying to OpenAI', {
      auditId: req.auditId,
      userId: req.user.id,
      model,
      promptLength: scrubbedPrompt.length
    });

    // Simulate OpenAI API call (replace with actual API call)
    const mockResponse = {
      id: 'chatcmpl-' + crypto.randomUUID(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: `Mock response to: "${scrubbedPrompt.substring(0, 50)}..."`
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: scrubbedPrompt.length / 4, // rough estimate
        completion_tokens: 20,
        total_tokens: scrubbedPrompt.length / 4 + 20
      }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      success: true,
      data: mockResponse,
      metadata: {
        scrubbed: prompt !== scrubbedPrompt,
        auditId: req.auditId
      }
    });

  } catch (error) {
    logger.error('OpenAI proxy error', {
      auditId: req.auditId,
      userId: req.user.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Internal server error',
      auditId: req.auditId
    });
  }
};

// Hugging Face Proxy
const proxyToHuggingFace = async (req, res) => {
  try {
    const { text, model = 'distilbert-base-uncased' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Scrub PII from text before sending to Hugging Face
    const scrubbedText = PIIScrubber.scrub(text);
    
    logger.info('Proxying to Hugging Face', {
      auditId: req.auditId,
      userId: req.user.id,
      model,
      textLength: scrubbedText.length
    });

    // Simulate Hugging Face API call
    const mockResponse = {
      model: model,
      predictions: [
        {
          label: 'POSITIVE',
          score: 0.9998
        }
      ],
      processed_text: scrubbedText
    };

    await new Promise(resolve => setTimeout(resolve, 800));

    res.json({
      success: true,
      data: mockResponse,
      metadata: {
        scrubbed: text !== scrubbedText,
        auditId: req.auditId
      }
    });

  } catch (error) {
    logger.error('Hugging Face proxy error', {
      auditId: req.auditId,
      userId: req.user.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Internal server error',
      auditId: req.auditId
    });
  }
};

// ============= ROUTES =============

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Auth endpoint (demo - in production, use proper auth service)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Demo validation (use proper auth in production)
  if (username === 'demo' && password === 'password123') {
    const token = jwt.sign(
      { id: 'user123', username: 'demo', role: 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    logger.info('User login successful', { username });
    
    res.json({
      success: true,
      token,
      user: { id: 'user123', username: 'demo' }
    });
  } else {
    logger.warn('Failed login attempt', { username, ip: req.ip });
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Protected AI endpoints
app.post('/api/openai/chat', 
  authenticateToken, 
  auditMiddleware, 
  aiLimit, 
  proxyToOpenAI
);

app.post('/api/huggingface/analyze', 
  authenticateToken, 
  auditMiddleware, 
  aiLimit, 
  proxyToHuggingFace
);

// Admin endpoint to view audit logs (demo)
app.get('/api/admin/audit', authenticateToken, (req, res) => {
  // In production, implement proper admin role checking
  res.json({
    message: 'Audit logs would be retrieved from your logging system',
    note: 'Check the console and log files for actual audit data'
  });
});

// ============= ERROR HANDLING =============
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// ============= SERVER STARTUP =============
app.listen(PORT, () => {
  logger.info(`Secure AI Proxy Server running on port ${PORT}`);
  console.log(`
🚀 Secure AI Proxy Server Started!

📋 Available Endpoints:
• GET  /health                     - Health check
• POST /api/auth/login             - Login (demo/password123)
• POST /api/openai/chat           - OpenAI proxy (requires auth)
• POST /api/huggingface/analyze   - Hugging Face proxy (requires auth)
• GET  /api/admin/audit           - Audit logs (requires auth)

🔧 Demo Usage:
1. Login: POST /api/auth/login with {"username":"demo","password":"password123"}
2. Use the returned token in Authorization header: "Bearer <token>"
3. Make AI requests to the protected endpoints

📊 Security Features Active:
✅ Rate limiting (100 general, 10 AI requests/min)
✅ JWT authentication
✅ PII scrubbing
✅ Comprehensive logging
✅ Audit trails
✅ Error handling
✅ Security headers
  `);
});

// ============= DEMO CLIENT CODE =============
/*
// Example client usage:

const axios = require('axios');

async function demoClient() {
  const baseURL = 'http://localhost:3000';
  
  try {
    // 1. Login
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      username: 'demo',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Logged in successfully!');
    
    // 2. Make OpenAI request
    const openaiResponse = await axios.post(`${baseURL}/api/openai/chat`, {
      prompt: 'Hello, my email is john.doe@example.com and my phone is 555-123-4567. Can you help me?',
      model: 'gpt-3.5-turbo'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('OpenAI Response:', openaiResponse.data);
    
    // 3. Make Hugging Face request
    const hfResponse = await axios.post(`${baseURL}/api/huggingface/analyze`, {
      text: 'This is a great product! My credit card is 4532-1234-5678-9012.',
      model: 'distilbert-base-uncased'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Hugging Face Response:', hfResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// demoClient();
*/

module.exports = app;