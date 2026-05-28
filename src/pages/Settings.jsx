import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Monitor, Cpu, Volume2, Shield } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    preferredAction: 'summarize',
    language: 'hebrew',
    theme: 'dark'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`settings_${currentUser.email}`);
      const savedGeminiKey = localStorage.getItem('gemini_api_key');
      const savedGroqKey = localStorage.getItem('groq_api_key');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (savedGeminiKey) parsed.geminiKey = savedGeminiKey;
        if (savedGroqKey) parsed.groqKey = savedGroqKey;
        setSettings(parsed);
      } else {
        setSettings(prev => ({
          ...prev, 
          geminiKey: savedGeminiKey || '',
          groqKey: savedGroqKey || ''
        }));
      }
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      localStorage.setItem(`settings_${currentUser.email}`, JSON.stringify(settings));
      if (settings.geminiKey) {
        localStorage.setItem('gemini_api_key', settings.geminiKey);
      } else {
        localStorage.removeItem('gemini_api_key');
      }
      if (settings.groqKey) {
        localStorage.setItem('groq_api_key', settings.groqKey);
      } else {
        localStorage.removeItem('groq_api_key');
      }
      alert('Settings saved locally to J.A.R.V.I.S Network!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-wrapper settings-page">
      <div className="header-bar">
        <h1 className="page-title text-gradient">System Configuration</h1>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
            <Monitor size={18} /> General System
          </button>
          <button className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
            <Cpu size={18} /> AI Core
          </button>
          <button className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`} onClick={() => setActiveTab('audio')}>
            <Volume2 size={18} /> Audio & Voice
          </button>
          <button className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => setActiveTab('privacy')}>
            <Shield size={18} /> Privacy
          </button>
        </div>

        <div className="settings-content glass-panel">
          {activeTab === 'general' && (
            <div className="tab-pane">
              <h2>General Preferences</h2>
              <p className="pane-desc">System-wide UI behaviors and localization.</p>
              
              <div className="form-group">
                <label>Interface Language</label>
                <select name="language" value={settings.language} onChange={handleChange} className="cyber-input">
                  <option value="hebrew">Hebrew</option>
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                </select>
              </div>

              <div className="form-group">
                <label>UI Theme</label>
                <select name="theme" value={settings.theme} onChange={handleChange} className="cyber-input">
                  <option value="dark">Jarvis Dark (Default)</option>
                  <option value="light">Stark Industries Light</option>
                  <option value="hacker">Terminal Neon</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="tab-pane">
              <h2>AI Core Settings</h2>
              <p className="pane-desc">Configure how the local AI Core interacts with your browsing.</p>

              <div className="local-ai-status-card" style={{
                background: 'rgba(0, 210, 255, 0.05)',
                border: '1px solid rgba(0, 210, 255, 0.2)',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <h4 style={{ color: '#00d2ff', marginTop: 0, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="status-dot-green" style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px #10b981'
                  }}></span>
                  Local AI Gateway Active
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                  This application is configured in <strong>DevOps/Local Mode</strong>. All cognitive services are routed through your local Ollama instance running the <strong>Gemma 4</strong> model.
                </p>
                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>
                  • Provider: <code>Ollama</code><br />
                  • Model: <code>gemma4 (configured in backend .env)</code><br />
                  • API Keys: <code>Disabled (No external billing or outbound connections)</code>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem', opacity: 0.5 }}>
                <label>Gemini API Key (External Mode - Disabled)</label>
                <input 
                  type="password" 
                  name="geminiKey" 
                  value="" 
                  disabled
                  className="cyber-input" 
                  placeholder="Managed locally by backend AI Gateway..." 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem', opacity: 0.5 }}>
                <label>Groq API Key (External Mode - Disabled)</label>
                <input 
                  type="password" 
                  name="groqKey" 
                  value="" 
                  disabled
                  className="cyber-input" 
                  placeholder="Managed locally by backend AI Gateway..." 
                />
                <small style={{color: '#64748b', marginTop: '8px', display:'block'}}>External API keys are disabled in this build to guarantee zero outbound network leaks.</small>
              </div>

              <div className="form-group">
                <label>Default Action on Selection</label>
                <select name="preferredAction" value={settings.preferredAction} onChange={handleChange} className="cyber-input">
                  <option value="summarize">Always Summarize</option>
                  <option value="explain">Always Explain</option>
                  <option value="rewrite">Always Rewrite</option>
                  <option value="ask">Prompt Me</option>
                </select>
              </div>

              <div className="form-group">
                <label>AI Personality Profile</label>
                <select className="cyber-input" disabled>
                  <option>Jarvis (Professional) - Active</option>
                </select>
                <small style={{color: '#64748b', marginTop: '8px', display:'block'}}>Other profiles require Pro license.</small>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="tab-pane">
               <h2>Audio & Voice</h2>
               <p className="pane-desc">Hardware settings for the Recordings and dictation features.</p>

               <div className="form-group">
                <label>Voice Output</label>
                <select className="cyber-input">
                  <option>Jarvis Synthetic Voice (En-US)</option>
                  <option>System Default</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="tab-pane">
               <h2>Privacy & Sync</h2>
               <p className="pane-desc">Manage what data is synced to the J.A.R.V.I.S network.</p>
               
               <div className="form-check">
                  <input type="checkbox" id="sync" defaultChecked />
                  <label htmlFor="sync">Sync Conversation History to MongoDB</label>
               </div>
               <div className="form-check" style={{marginTop: '1rem'}}>
                  <input type="checkbox" id="telemetry" />
                  <label htmlFor="telemetry">Send anonymous UI usage metrics to admin</label>
               </div>
            </div>
          )}

          <div className="settings-footer">
            <button 
              className="btn-primary" 
              onClick={handleSave}
              disabled={isSaving}
              style={{width: '200px'}}
            >
              {isSaving ? 'Processing...' : 'Apply Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
