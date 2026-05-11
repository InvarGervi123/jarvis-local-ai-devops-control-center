import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, BrainCircuit, Zap, Clock } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ totalQueries: 0, recentActions: 0, tokensUsed: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/ai/history`, {
          headers: {
            'x-auth-token': token
          }
        });
        const historyData = await res.json();
        
        if (!res.ok) throw new Error("Failed to fetch history");

        const total = historyData.length;
        let recentCnt = 0;
        const now = new Date();
        const daysMap = {};
        
        // Initialize last 7 days for chart
        for(let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          daysMap[d.toLocaleDateString('en-US', {weekday: 'short'})] = 0;
        }

        historyData.forEach(doc => {
          if (doc.createdAt) {
            const dateObj = new Date(doc.createdAt);
            const diffMs = now - dateObj;
            if (diffMs < 24 * 60 * 60 * 1000) recentCnt++; 
            
            const dayName = dateObj.toLocaleDateString('en-US', {weekday: 'short'});
            if(daysMap[dayName] !== undefined) {
              daysMap[dayName]++;
            }
          }
        });

        // Format chart data
        const formattedChartData = Object.keys(daysMap).map(key => ({
          name: key,
          queries: daysMap[key]
        }));
        setChartData(formattedChartData);
        setStats({ totalQueries: total, recentActions: recentCnt, tokensUsed: total * 150 });
        
        // Get top 4 recent
        setRecentActivity(historyData.slice(0, 4));
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    }
    fetchData();
  }, [currentUser]);

  return (
    <div className="page-wrapper dashboard-page">
      <div className="header-bar">
        <h1 className="page-title text-gradient">System Overview</h1>
        <div className="user-badge">
          <span className="pulse-dot"></span> Online - {currentUser?.email}
        </div>
      </div>

      <div className="stats-matrix">
        <div className="glass-panel matrix-card">
          <Activity size={24} color="#00d2ff" className="matrix-icon" />
          <div className="matrix-info">
            <h3>Total Queries</h3>
            <div className="stat-value">{stats.totalQueries}</div>
          </div>
        </div>
        <div className="glass-panel matrix-card">
          <Clock size={24} color="#00d2ff" className="matrix-icon" />
          <div className="matrix-info">
            <h3>Recent Actions (24h)</h3>
            <div className="stat-value">{stats.recentActions}</div>
          </div>
        </div>
        <div className="glass-panel matrix-card">
          <BrainCircuit size={24} color="#00d2ff" className="matrix-icon" />
          <div className="matrix-info">
            <h3>Est. AI Tokens Use</h3>
            <div className="stat-value">{stats.tokensUsed}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel chart-section">
          <h2 className="section-title"><Zap size={20} /> Weekly Activity</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#8b9bb4" />
                <YAxis stroke="#8b9bb4" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(7, 9, 15, 0.9)', borderColor: '#00d2ff' }} />
                <Line type="monotone" dataKey="queries" stroke="#00d2ff" strokeWidth={3} dot={{ r: 4, fill: '#00d2ff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel recent-activity">
          <h2 className="section-title">Recent Transmissions</h2>
          <div className="activity-feed">
            {recentActivity.length === 0 ? (
              <p className="empty-state">No activity records found. Waiting for input.</p>
            ) : (
              recentActivity.map(act => (
                <div key={act.id} className="feed-item">
                  <div className="feed-icon">{act.actionType?.substring(0,1).toUpperCase()}</div>
                  <div className="feed-details">
                    <h4>{act.actionType}</h4>
                    <p>"{act.selectedText?.substring(0, 50)}..."</p>
                  </div>
                  <span className="feed-time">
                    {act.createdAt ? new Date(act.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
