import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Trash2, Calendar } from 'lucide-react';
import './History.css';

export default function History() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  async function fetchHistory() {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/ai/history`, {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error("Failed to fetch history");

      // Remap _id to id for consistency with existing UI
      const formattedData = data.map(item => ({ id: item._id, ...item }));
      
      setHistory(formattedData);
      setFilteredHistory(formattedData);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  useEffect(() => {
    let result = history;
    if (activeFilter !== 'all') {
      result = result.filter(item => item.actionType.toLowerCase() === activeFilter.toLowerCase());
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.selectedText && item.selectedText.toLowerCase().includes(lower)) ||
        (item.aiResponse && item.aiResponse.toLowerCase().includes(lower))
      );
    }
    setFilteredHistory(result);
  }, [searchTerm, activeFilter, history]);

  async function handleDelete(id) {
    if (!window.confirm("Purge this record from the grid?")) return;
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/ai/history/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      
      if (!res.ok) throw new Error("Failed to delete record");

      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  }

  return (
    <div className="page-wrapper history-page">
      <div className="header-bar">
        <h1 className="page-title text-gradient">Search & History</h1>
        <div className="search-bar">
          <Search size={18} color="#8b9bb4" />
          <input 
            type="text" 
            placeholder="Search transcripts..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="filters-row">
        <Filter size={18} color="#00d2ff" />
        <button className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
        <button className={`filter-pill ${activeFilter === 'summarize' ? 'active' : ''}`} onClick={() => setActiveFilter('summarize')}>Summarize</button>
        <button className={`filter-pill ${activeFilter === 'explain' ? 'active' : ''}`} onClick={() => setActiveFilter('explain')}>Explain</button>
        <button className={`filter-pill ${activeFilter === 'rewrite' ? 'active' : ''}`} onClick={() => setActiveFilter('rewrite')}>Rewrite</button>
      </div>

      <div className="glass-panel table-container">
        {loading ? (
           <div className="loading-state">Syncing data from MongoDB...</div>
        ) : filteredHistory.length === 0 ? (
           <div className="empty-state">No matching records found.</div>
        ) : (
          <div className="history-grid">
            {filteredHistory.map(item => (
              <div className="history-card" key={item.id}>
                <div className="card-header">
                  <span className={`badge badge-${item.actionType}`}>{item.actionType}</span>
                  <div className="card-actions">
                    <span className="date-stamp"><Calendar size={14}/> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
                    <button className="icon-btn delete" onClick={() => handleDelete(item.id)}><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="text-section">
                    <strong>Input:</strong>
                    <p>{item.selectedText}</p>
                  </div>
                  <div className="text-section ai-output">
                    <strong>Response:</strong>
                    <p>{item.aiResponse}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
