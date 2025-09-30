import { useState } from 'react';

export const useAI = () => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const generateResponse = async (message) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }]
        })
      });
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
   const generateResponseWithContext = async (messageHistory) => {
    // 1. Validate no sensitive data in messages
  const hasSensitiveInfo = messageHistory.some(msg => 
    /\d{16}|\d{3}-\d{2}-\d{4}/.test(msg.content) // Card/SSN patterns
  );
  
  if (hasSensitiveInfo) {
    return "For security, please don't share account numbers in chat.";
  }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messageHistory, // Pass full history for context
        max_tokens: 150,
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    console.log('Tokens used:', data.usage.total_tokens);
    console.log('Estimated cost:', (data.usage.total_tokens / 1000) * 0.002);
    return data.choices[0].message.content;
  };
  return { generateResponse, loading, error, generateResponseWithContext };
};

/**
 * // Without context (bad):
User: "What are your rates?"
AI: "What type of rates are you asking about?"

User: "For $10,000"  
AI: "I need more context. What are you referring to?"  // AI is confused!

// With context (good):
[
  { role: 'user', content: 'What are your loan rates?' },
  { role: 'assistant', content: 'Personal loans start at 5.99% APR' },
  { role: 'user', content: 'For $10,000?' }  
]
AI: "For a $10,000 personal loan, you'd pay approximately $189/month..."  // AI understands!

Message Format:
javascript{
  role: 'user' | 'assistant' | 'system',
  content: 'The actual message text'
}

user: Messages from the customer
assistant: AI's previous responses
system: Instructions for the AI (optional)

Example:

const messageHistory = [
  { 
    role: 'system', 
    content: 'You are a professional banking assistant. Never ask for account numbers or passwords.'
  },
  { role: 'user', content: 'How do I check my balance?' },
  { role: 'assistant', content: 'You can check your balance in our mobile app...' },
  { role: 'user', content: 'Is it secure?' }
];

max_tokens: 150
Controls the length of the AI's response.
What's a token?

Roughly 4 characters or ¾ of a word
Example: "Hello, how are you?" ≈ 6 tokens

Token Calculations:

150 tokens ≈ 100-120 words ≈ 1-2 paragraphs
500 tokens ≈ 350-400 words ≈ longer explanation
1000 tokens ≈ 750 words ≈ detailed article

Why limit tokens?

Cost control: You pay per token (~$0.002 per 1K tokens)
Response speed: Shorter responses are faster
User experience: Concise answers are better for chat

temperature: 0.7

Controls the creativity/randomness of responses.

Scale: 0.0 to 2.0

Temperature     Behavior                        Use Case
0.0 - 0.3       Focused, consistent, factual    Banking facts, regulations, calculations
0.4 - 0.7       Balanced, natural conversation  Customer service, general queries
0.8 - 1.5       Creative, varied responses      Marketing content, brainstorming
1.6 - 2.0       Very random, unpredictable      Creative writing (not for banking!)

Response structure from OpenAi

{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1699123456,
  "model": "gpt-3.5-turbo",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Based on your $10,000 loan inquiry, you'd pay approximately $189/month at 5.99% APR over 5 years."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 32,
    "total_tokens": 77
  }
}


 */