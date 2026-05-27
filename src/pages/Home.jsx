import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Zap, Shield, Globe, Cpu, Sparkles, Server, CheckCircle2, ChevronRight } from 'lucide-react';
import './Home.css';

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="logo-glow">J.A.R.V.I.S</div>
        <div className="nav-links hidden-mobile">
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-actions">
          {currentUser ? (
            <button onClick={() => navigate('/dashboard')} className="btn-primary">Enter Core</button>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-primary">Initialize Access</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="badge-glow"><Sparkles size={16}/> System OS Version 2.0 Online</div>
          <h1 className="hero-title">Next-Gen Browsing <br/><span className="text-gradient">Intelligence</span></h1>
          <p className="hero-subtitle">
            Highlight text anywhere. Execute AI commands instantly. 
            Summarize, explain, and rewrite across the web with the J.A.R.V.I.S Web OS.
          </p>
          <div className="hero-actions">
            {!currentUser ? (
              <Link to="/login" className="btn-primary" style={{padding: '16px 32px', fontSize: '1.2rem'}}>Start Terminal <ChevronRight size={20}/></Link>
            ) : (
              <Link to="/dashboard" className="btn-primary" style={{padding: '16px 32px', fontSize: '1.2rem'}}>Open Dashboard <ChevronRight size={20}/></Link>
            )}
            <a href="#features" className="btn-secondary" style={{padding: '16px 32px', fontSize: '1.2rem'}}>View Specs</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="glow-sphere"></div>
          <div className="glow-sphere second"></div>
          <div className="hologram-circle"></div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Core Capabilities</h2>
          <p>Engineered for maximum web efficiency and dynamic processing.</p>
        </div>
        <div className="features-grid">
          <FeatureCard 
            icon={<Zap size={32} color="#00d2ff" />}
            title="Instant Execution"
            desc="Select text on any webpage and execute AI functions directly from the Chrome extension."
          />
          <FeatureCard 
            icon={<BrainCircuit size={32} color="#00d2ff" />}
            title="Gemini 2.5 Flash"
            desc="Powered by Google's latest hyper-fast LLM architectures for real-time natural language processing."
          />
          <FeatureCard 
            icon={<Server size={32} color="#00d2ff" />}
            title="MongoDB Sync"
            desc="Your query history is securely synced to a centralized MongoDB Atlas cloud cluster via Node.js."
          />
          <FeatureCard 
            icon={<Shield size={32} color="#00d2ff" />}
            title="Hybrid BYOK"
            desc="Bring your own key (BYOK) securely. Keys are transmitted via encrypted headers, never saved to DB."
          />
          <FeatureCard 
            icon={<Cpu size={32} color="#00d2ff" />}
            title="Centralized Analytics"
            desc="Monitor your interaction metrics, token usage, and search patterns from an Iron Man inspired dashboard."
          />
          <FeatureCard 
            icon={<Globe size={32} color="#00d2ff" />}
            title="Universal Translation"
            desc="Dynamically translate explanations and summaries into dozens of languages seamlessly."
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-header">
          <h2>System Diagnostics (FAQ)</h2>
          <p>Common queries from field operatives.</p>
        </div>
        <div className="faq-grid">
          <div className="glass-panel faq-item">
            <h4>Is my data secure?</h4>
            <p>Yes. All text selections and AI responses are securely transmitted via JWT-authenticated Node.js endpoints and stored in your private MongoDB cluster.</p>
          </div>
          <div className="faq-item glass-panel">
            <h4>How does Hybrid BYOK work?</h4>
            <p>You can input your own Google Gemini API key into the extension. It is saved locally in your browser and sent securely via headers to process AI requests.</p>
          </div>
          <div className="faq-item glass-panel">
            <h4>Does it work on any website?</h4>
            <p>Yes, the Chrome extension injects a content script that works universally across standard webpages.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="logo-glow" style={{fontSize: '1.2rem'}}>J.A.R.V.I.S</div>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">System Status</a>
        </div>
        <p>Advanced Agentic Web Interface © 2026. All Systems Nominal.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass-panel feature-card">
      <div className="feature-icon-wrapper">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
