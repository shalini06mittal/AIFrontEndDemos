import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AiAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successRate: 0,
    averageResponseTime: 0,
    topQueries: [],
    usageOverTime: []
  });
  
  const [realtimeData, setRealtimeData] = useState([]);
  
  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        requests: Math.floor(Math.random() * 50) + 10,
        responseTime: Math.floor(Math.random() * 1000) + 200,
        successRate: Math.random() * 20 + 80
      };
      
      setRealtimeData(prev => {
        const updated = [...prev, newDataPoint];
        return updated.slice(-20); // Keep last 20 points
      });
      
      setMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + newDataPoint.requests,
        averageResponseTime: newDataPoint.responseTime,
        successRate: newDataPoint.successRate
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="ai-dashboard">
      <h2>AI Usage Analytics</h2>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Requests</h3>
          <div className="metric-value">{metrics.totalRequests.toLocaleString()}</div>
        </div>
        
        <div className="metric-card">
          <h3>Success Rate</h3>
          <div className="metric-value">{metrics.successRate.toFixed(1)}%</div>
        </div>
        
        <div className="metric-card">
          <h3>Avg Response Time</h3>
          <div className="metric-value">{metrics.averageResponseTime}ms</div>
        </div>
      </div>
      
      <div className="chart-container">
        <h3>Real-time AI Requests</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={realtimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="requests" stroke="#2196f3" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="top-queries">
        <h3>Popular Queries</h3>
        <ul>
          <li>What is machine learning? <span className="query-count">(45)</span></li>
          <li>How to optimize React performance? <span className="query-count">(38)</span></li>
          <li>Explain neural networks <span className="query-count">(32)</span></li>
          <li>JavaScript best practices <span className="query-count">(28)</span></li>
          <li>AI in web development <span className="query-count">(24)</span></li>
        </ul>
      </div>
    </div>
  );
};

export default AiAnalyticsDashboard;