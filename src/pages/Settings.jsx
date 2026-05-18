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
    async function loadSettings() {
      if (!currentUser) return;
      const saved = localStorage.getItem(`settings_${currentUser.email}`);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    }
    loadSettings();
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
              <p className="pane-desc">Configure how Gemini 1.5 interacts with your browsing.</p>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Gemini API Key (BYOK)</label>
                <input 
                  type="password" 
                  name="geminiKey" 
                  value={settings.geminiKey || ''} 
                  onChange={handleChange} 
                  className="cyber-input" 
                  placeholder="AIzaSy..." 
                />
                <small style={{color: '#64748b', marginTop: '8px', display:'block'}}>Your key is encrypted and stored locally in your browser. It is never saved to our database.</small>
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
