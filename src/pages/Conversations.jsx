import React, { useState, useEffect } from 'react';
import { Send, Menu, Bot, User, ImagePlus, Mic, MessageSquare } from 'lucide-react';
import './Conversations.css';

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/ai/history`, {
          headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        
        if (res.ok) {
          const formatted = data.map(item => ({ id: item._id, ...item }));
          setConversations(formatted);
          if (formatted.length > 0) setActiveThreadId(formatted[0].id);
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const activeThread = conversations.find(c => c.id === activeThreadId);

  return (
    <div className="page-wrapper conversations-page">
      <div className="chat-layout">
        <aside className="chat-sidebar glass-panel">
          <div className="sidebar-header">
            <h3><MessageSquare size={16} style={{marginRight: '8px'}}/> Active Threads</h3>
          </div>
          <div className="thread-list">
            {loading && <p style={{padding: '15px', color: '#8b9bb4', fontSize: '14px'}}>Decrypting logs...</p>}
            {!loading && conversations.length === 0 && <p style={{padding: '15px', color: '#8b9bb4', fontSize: '14px'}}>No comm logs found.</p>}
            {conversations.map(thread => (
              <div 
                key={thread.id} 
                className={`thread-item ${activeThreadId === thread.id ? 'active' : ''}`}
                onClick={() => setActiveThreadId(thread.id)}
              >
                <div className="thread-title">"{thread.selectedText?.substring(0, 25)}..."</div>
                <div className="thread-preview" style={{textTransform: 'capitalize'}}>{thread.actionType} • {new Date(thread.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </aside>

        <main className="chat-main glass-panel">
          {activeThread ? (
            <>
              <div className="chat-header">
                <div className="chat-title-group">
                  <h2 className="chat-active-title">Transcript: {activeThread.actionType}</h2>
                  <span className="status-badge">🟢 MongoDB Secure Sync</span>
                </div>
              </div>

              <div className="chat-messages">
                <div className="message-wrapper msg-right">
                  <div className="message-bubble">
                    <div className="msg-icon"><User size={16} /></div>
                    <div className="msg-text">{activeThread.selectedText}</div>
                  </div>
                </div>

                <div className="message-wrapper msg-left">
                  <div className="message-bubble" style={{borderColor: '#00d2ff'}}>
                    <div className="msg-icon"><Bot size={16} color="#00d2ff"/></div>
                    <div className="msg-text">{activeThread.aiResponse}</div>
                  </div>
                </div>
              </div>

              <div className="chat-input-area" style={{opacity: 0.7}}>
                <button type="button" className="action-icon" disabled><ImagePlus size={20}/></button>
                <button type="button" className="action-icon" disabled><Mic size={20}/></button>
                <input 
                  type="text" 
                  className="cyber-input" 
                  placeholder="Incoming transmissions are read-only. Use extension to submit new queries..."
                  disabled
                />
                <button type="submit" className="send-btn" disabled><Send size={18}/></button>
              </div>
            </>
          ) : (
             <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#8b9bb4'}}>
              <Bot size={48} color="#00d2ff" style={{opacity: 0.5, marginBottom: '20px'}}/>
              <h2>Awaiting Transmission</h2>
              <p>Select a thread from the sidebar to view the transcript.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
