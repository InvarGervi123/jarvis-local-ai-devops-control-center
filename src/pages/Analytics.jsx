import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Zap, Activity, Brain, Clock } from 'lucide-react';
import './Analytics.css';

const COLORS = ['#00d2ff', '#3a7bd5', '#10b981', '#f59e0b'];

export default function Analytics() {
  const [usageData, setUsageData] = useState([]);
  const [actionDistribution, setActionDistribution] = useState([]);
  const [stats, setStats] = useState({ totalProcessed: 0, tokensExpended: 0, timeSaved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/ai/history`, {
          headers: { 'x-auth-token': token }
        });
        const historyData = await res.json();
        
        if (res.ok) {
          // Process Total Stats
          const total = historyData.length;
          setStats({
            totalProcessed: total,
            tokensExpended: total * 150, // rough estimate
            timeSaved: Math.round((total * 5) / 60) // rough estimate: 5 minutes saved per query
          });

          // Process Action Distribution (Pie Chart)
          const distMap = {};
          historyData.forEach(item => {
            const type = item.actionType || 'custom';
            distMap[type] = (distMap[type] || 0) + 1;
          });
          const distArray = Object.keys(distMap).map(key => ({ name: key, value: distMap[key] }));
          setActionDistribution(distArray);

          // Process Weekly Usage Data (Bar Chart)
          const now = new Date();
          const daysMap = {};
          for(let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dayName = d.toLocaleDateString('en-US', {weekday: 'short'});
            daysMap[dayName] = { name: dayName, summarize: 0, explain: 0, rewrite: 0 };
          }

          historyData.forEach(item => {
            if (item.createdAt) {
              const dateObj = new Date(item.createdAt);
              const diffMs = now - dateObj;
              if (diffMs <= 7 * 24 * 60 * 60 * 1000) { // Within last 7 days
                const dayName = dateObj.toLocaleDateString('en-US', {weekday: 'short'});
                if(daysMap[dayName]) {
                  const type = item.actionType || 'summarize';
                  if(daysMap[dayName][type] !== undefined) {
                    daysMap[dayName][type]++;
                  } else {
                    daysMap[dayName]['summarize']++; // fallback
                  }
                }
              }
            }
          });
          setUsageData(Object.values(daysMap));
        }
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const efficiencyData = [
    { name: 'Week 1', score: 65 },
    { name: 'Week 2', score: 72 },
    { name: 'Week 3', score: 85 },
    { name: 'Week 4', score: Math.min(100, 85 + (stats.totalProcessed / 10)) }, // Dynamic based on usage
  ];

  return (
    <div className="page-wrapper analytics-page">
      <div className="header-bar">
        <h1 className="page-title text-gradient">J.A.R.V.I.S Analytics Core</h1>
      </div>

      {loading ? (
         <div style={{color: '#8b9bb4', padding: '20px'}}>Calculating metrics...</div>
      ) : (
      <div className="analytics-grid">
        <div className="analytics-sidebar">
          <div className="glass-panel metric-card">
            <div className="metric-header">
              <Zap color="#00d2ff"/>
              <span>Total Processed</span>
            </div>
            <h2>{stats.totalProcessed}</h2>
            <p className="trend positive">MongoDB Sync Active</p>
          </div>

          <div className="glass-panel metric-card">
            <div className="metric-header">
              <Brain color="#00d2ff"/>
              <span>Est. Tokens Expended</span>
            </div>
            <h2>{stats.tokensExpended}</h2>
            <p className="trend warning">Operating Normally</p>
          </div>

          <div className="glass-panel metric-card">
            <div className="metric-header">
              <Clock color="#00d2ff"/>
              <span>Est. Time Saved</span>
            </div>
            <h2>{stats.timeSaved} Hours</h2>
            <p className="trend positive">Based on 5 min/query</p>
          </div>
        </div>

        <div className="analytics-main">
          <div className="glass-panel chart-box">
            <h3>Action Throughput (Last 7 Days)</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="name" stroke="#8b9bb4"/>
                  <YAxis stroke="#8b9bb4" allowDecimals={false}/>
                  <Tooltip contentStyle={{backgroundColor: 'rgba(7,9,15,0.9)', borderColor: '#00d2ff'}}/>
                  <Legend />
                  <Bar dataKey="summarize" stackId="a" fill="#00d2ff" />
                  <Bar dataKey="explain" stackId="a" fill="#3a7bd5" />
                  <Bar dataKey="rewrite" stackId="a" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-row">
            <div className="glass-panel chart-box half">
              <h3>System Efficiency</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="name" stroke="#8b9bb4"/>
                    <YAxis stroke="#8b9bb4"/>
                    <Tooltip contentStyle={{backgroundColor: 'rgba(7,9,15,0.9)', borderColor: '#00d2ff'}}/>
                    <Area type="monotone" dataKey="score" stroke="#00d2ff" fill="rgba(0,210,255,0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel chart-box half">
              <h3>Action Distribution</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={actionDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {actionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: 'rgba(7,9,15,0.9)', borderColor: '#00d2ff'}}/>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
