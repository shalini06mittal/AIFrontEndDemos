import React, { useState } from 'react';
import { useAI } from '../service/useAI';
import './AiChat.css';

const AiChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const { generateResponse, loading, error , generateResponseWithContext} = useAI();
  
  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage = { role: 'user', content: userInput };
   // setMessages(prev => [...prev, userMessage]);
     const newMessages = [...messages, userMessage];
     setMessages(newMessages)
    setUserInput('');
    
    try {
    //   const aiResponse = await generateResponse(userInput);
      // Pass conversation history for context
      const aiResponse = await generateResponseWithContext(newMessages);
      const aiMessage = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI Error:', err);
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: 'Sorry, there was an error processing your message.' 
      }]);
    }
  };
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <div className="loading">AI is thinking...</div>}
        {error && <div className="error">Error: {error}</div>}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !userInput.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default AiChatComponent;