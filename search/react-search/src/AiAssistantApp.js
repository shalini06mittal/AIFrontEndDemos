import React, { useState } from 'react';
import AiChatComponent from './components/AiChatComponent';
import SmartSearch from './components/SmartSearch';
import PersonalizedRecommendations from './components/PersonalizedRecommendations';
import VoiceAI from './components/VoiceAI';
import AiAnalyticsDashboard from './components/AiAnalyticsDashboard';

const AiAssistantApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [user] = useState({
    id: 1,
    name: 'John Doe',
    interests: ['technology', 'programming', 'AI'],
    purchaseHistory: ['laptop', 'books', 'courses'],
    budgetRange: '$100-500',
    preferredCategories: ['electronics', 'education']
  });
  
  const tabs = [
    { id: 'chat', label: 'AI Chat', component: AiChatComponent },
    { id: 'search', label: 'Smart Search', component: SmartSearch },
    { id: 'recommendations', label: 'Recommendations', component: PersonalizedRecommendations },
    { id: 'voice', label: 'Voice AI', component: VoiceAI },
    { id: 'analytics', label: 'Analytics', component: AiAnalyticsDashboard }
  ];
  
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;
  
  return (
    <div className="ai-assistant-app">
      <header className="app-header">
        <h1>AI-Powered Assistant</h1>
        <p>Welcome, {user.name}!</p>
      </header>
      
      <nav className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      
      <main className="app-content">
        {ActiveComponent && (
          <ActiveComponent 
            userId={user.id} 
            userPreferences={user}
          />
        )}
      </main>
    </div>
  );
};

export default AiAssistantApp;