import React, { useState, useEffect } from 'react';
import { Server, Database, Users, ShieldAlert, Cpu, Activity, Power, Trash2, ShieldCheck } from 'lucide-react';
import './Admin.css';

export default function Admin() {
  const [cpuUsage, setCpuUsage] = useState(42);
  const [memUsage, setMemUsage] = useState(68);

  // Simulate dynamic server stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))));
      setMemUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() * 4 - 2))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const mockUsers = [
    { id: 'usr_001', name: 'Tony Stark', email: 'tony@stark.com', role: 'Director', status: 'Active', lastLogin: '2 mins ago' },
    { id: 'usr_002', name: 'Pepper Potts', email: 'pepper@stark.com', role: 'Admin', status: 'Active', lastLogin: '1 hour ago' },
    { id: 'usr_003', name: 'James Rhodes', email: 'rhodey@usaf.mil', role: 'Operative', status: 'Offline', lastLogin: '2 days ago' },
    { id: 'usr_004', name: 'Peter Parker', email: 'peter@midtown.edu', role: 'Intern', status: 'Restricted', lastLogin: '5 mins ago' },
  ];

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
              <div className="vital-value text-green">Nominal</div>
              <p className="vital-subtext">Latency: 24ms | Operations: 412/s</p>
            </div>
          </div>

          <div className="glass-panel vital-card error-pulse">
            <div className="vital-header">
              <ShieldAlert size={24} color="#f59e0b"/>
              <h4>Security Threats</h4>
            </div>
            <div className="vital-content">
              <div className="vital-value text-warning">2 Active</div>
              <p className="vital-subtext">Unauthorized ping from Subnet 7</p>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="admin-bottom-grid">
          
          {/* User Management Table */}
          <div className="glass-panel users-panel">
            <div className="panel-header">
              <h3><Users size={18}/> Active Operatives</h3>
              <span className="badge">4 Total</span>
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
                  {mockUsers.map(user => (
                    <tr key={user.id}>
                      <td className="text-muted">{user.id}</td>
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
                  ))}
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
              <div className="log-line"><span className="time">[14:02:44]</span> <span className="info">INFO</span> J.A.R.V.I.S kernel initialized.</div>
              <div className="log-line"><span className="time">[14:02:45]</span> <span className="info">INFO</span> MongoDB Atlas connection established.</div>
              <div className="log-line"><span className="time">[14:03:12]</span> <span className="warn">WARN</span> High token usage detected on Node 3.</div>
              <div className="log-line"><span className="time">[14:05:00]</span> <span className="error">ERR</span> Extension auth token sync failed for usr_004.</div>
              <div className="log-line"><span className="time">[14:08:22]</span> <span className="info">INFO</span> Document review engine processed 4.2k words.</div>
              <div className="log-line"><span className="time">[14:10:05]</span> <span className="info">INFO</span> Screen analysis module active.</div>
              <div className="log-cursor">_</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
