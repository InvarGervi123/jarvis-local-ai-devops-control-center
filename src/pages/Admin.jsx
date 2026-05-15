import React, { useState, useEffect } from 'react';
import { Server, Database, Users, ShieldAlert, Cpu, Activity, Power, Trash2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

export default function Admin() {
  const { currentUser } = useAuth();
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memUsage, setMemUsage] = useState(0);
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  // Fetch Real Server Stats and Users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/admin/stats`);
        const result = await res.json();
        
        if (result.success) {
          setCpuUsage(result.data.vitals.cpuUsage);
          setMemUsage(result.data.vitals.memUsage);
          setDbStatus('Connected');
          setUsers(result.data.users);
          
          // Add a dynamic log entry
          const time = new Date().toLocaleTimeString('en-US', { hour12: false });
          setLogs(prev => {
            const newLogs = [...prev, { time: `[${time}]`, type: 'info', msg: 'Fetched live telemetry from Node.js core.' }];
            return newLogs.length > 6 ? newLogs.slice(newLogs.length - 6) : newLogs;
          });
        }
      } catch (err) {
        setDbStatus('Disconnected');
        console.error("Failed to fetch admin stats");
      }
    };

    fetchData(); // Initial fetch
    
    // Poll every 5 seconds for real-time feel
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-wrapper admin-page">
      <div className="header-bar">
        <h1 className="page-title text-gradient">J.A.R.V.I.S Core Override (Admin)</h1>
        <div className="header-actions">
          <button className="btn-secondary" style={{borderColor: '#ef4444', color: '#f87171'}}><Power size={18}/> Initiate Lockdown</button>
        </div>
      </div>

      <div className="admin-grid">
        
        {/* Top Row: System Vitals */}
        <div className="admin-vitals">
          <div className="glass-panel vital-card">
            <div className="vital-header">
              <Cpu size={24} color="#00d2ff"/>
              <h4>CPU Matrix</h4>
            </div>
            <div className="vital-content">
              <div className="vital-value">{cpuUsage.toFixed(1)}%</div>
              <div className="progress-bg">
                <div className="progress-fill" style={{width: `${cpuUsage}%`, backgroundColor: cpuUsage > 80 ? '#ef4444' : '#00d2ff'}}></div>
              </div>
            </div>
          </div>

          <div className="glass-panel vital-card">
            <div className="vital-header">
              <Server size={24} color="#00d2ff"/>
              <h4>Memory Allocation</h4>
            </div>
            <div className="vital-content">
              <div className="vital-value">{memUsage.toFixed(1)}%</div>
              <div className="progress-bg">
                <div className="progress-fill" style={{width: `${memUsage}%`}}></div>
              </div>
            </div>
          </div>

          <div className="glass-panel vital-card">
            <div className="vital-header">
              <Database size={24} color="#10b981"/>
              <h4>MongoDB Cluster</h4>
            </div>
            <div className="vital-content">
              <div className={dbStatus === 'Connected' ? "vital-value text-green" : "vital-value text-danger"}>{dbStatus}</div>
              <p className="vital-subtext">Latency: 24ms | Operations: 412/s</p>
            </div>
          </div>

          <div className="glass-panel vital-card error-pulse">
            <div className="vital-header">
              <ShieldAlert size={24} color="#f59e0b"/>
              <h4>Security Threats</h4>
            </div>
            <div className="vital-content">
              <div className="vital-value text-warning">0 Active</div>
              <p className="vital-subtext">No recent anomalies</p>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="admin-bottom-grid">
          
          {/* User Management Table */}
          <div className="glass-panel users-panel">
            <div className="panel-header">
              <h3><Users size={18}/> Active Operatives</h3>
              <span className="badge">{users.length} Total</span>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Operative</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Access</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px', color: '#8b9bb4'}}>No users found. Ensure backend is connected.</td></tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id}>
                        <td className="text-muted">{user.id.substring(0,8)}...</td>
                        <td>
                          <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                          </div>
                        </td>
                        <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                        <td>
                          <span className="status-indicator">
                            <span className={`dot ${user.status.toLowerCase()}`}></span> {user.status}
                          </span>
                        </td>
                        <td className="text-muted">{user.lastLogin}</td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn" title="Verify Clearance"><ShieldCheck size={16}/></button>
                            <button className="action-btn danger" title="Revoke Access"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Log */}
          <div className="glass-panel logs-panel">
            <div className="panel-header">
              <h3><Activity size={18}/> System Logs</h3>
            </div>
            <div className="terminal-logs">
              <div className="log-line"><span className="time">[Init]</span> <span className="info">INFO</span> J.A.R.V.I.S kernel initialized.</div>
              {logs.map((log, i) => (
                <div key={i} className="log-line">
                  <span className="time">{log.time}</span> <span className={log.type}>{log.type.toUpperCase()}</span> {log.msg}
                </div>
              ))}
              <div className="log-cursor">_</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
