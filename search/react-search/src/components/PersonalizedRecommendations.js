import React, { useState, useEffect } from "react";

//User-Aware Recommendations
const PersonalizedRecommendations = ({ userId, userPreferences }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const generatePersonalizedPrompt = (user, context) => {
    return `
      Generate personalized recommendations for a user with the following profile:
      - Interests: ${user.interests.join(', ')}
      - Previous purchases: ${user.purchaseHistory.join(', ')}
      - Budget range: ${user.budgetRange}
      - Preferred categories: ${user.preferredCategories.join(', ')}
      
      Context: ${context}
      
      Provide 5 specific recommendations with brief explanations.
    `;
  };
  
  const fetchRecommendations = async () => {
    setLoading(true);
    
    try {
      const prompt = generatePersonalizedPrompt(userPreferences, 'product recommendations');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      const data = await response.json();
      const recommendationText = data.choices[0].message.content;
      
      // Parse recommendations (would implement proper parsing)
      setRecommendations(parseRecommendations(recommendationText));
    } catch (error) {
      console.error('Recommendation error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const parseRecommendations = (text) => {
    // Simple parsing - in production, use more robust parsing
    return text.split('\n').filter(line => line.trim()).map((line, index) => ({
      id: index,
      text: line,
      confidence: Math.random() * 100
    }));
  };
  
  useEffect(() => {
    if (userPreferences && userId) {
      fetchRecommendations();
    }
  }, [userId, userPreferences]);
  
  if (loading) return <div className="loading">Generating personalized recommendations...</div>;
  
  return (
    <div className="recommendations">
      <h3>Recommended for You</h3>
      {recommendations.map(rec => (
        <div key={rec.id} className="recommendation-item">
          <p>{rec.text}</p>
          <span className="confidence">Confidence: {rec.confidence.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

export default PersonalizedRecommendations;