import React, { useState } from 'react';
import { ScanText, FileText, CheckCircle2, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import './DocumentReview.css';

export default function DocumentReview() {
  const [text, setText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);

  const handleScan = async () => {
    if (!text.trim()) return;
    setIsScanning(true);
    setResults(null);

    try {
      const token = localStorage.getItem('token');
      const geminiKey = localStorage.getItem('gemini_api_key') || '';
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const res = await fetch(`${API_URL}/api/ai/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
          'x-gemini-key': geminiKey
        },
        body: JSON.stringify({ type: 'review', text })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.msg || data.data || 'Failed to process document');
      
      // Parse the JSON returned by Gemini
      let parsedResults;
      try {
        // Sometimes Gemini adds markdown backticks even when told not to
        const cleanJsonString = data.data.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResults = JSON.parse(cleanJsonString);
      } catch (parseError) {
        throw new Error('AI returned an invalid format. Please try again.');
      }

      setResults({
        ...parsedResults,
        wordCount: text.trim().split(/\s+/).length
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="page-wrapper doc-review-page">
      <div className="header-bar">
        <h1 className="page-title text-gradient">Document Review Engine</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => {setText(''); setResults(null);}}>Clear Editor</button>
          <button className="btn-primary" onClick={handleScan} disabled={isScanning || !text.trim()}>
            {isScanning ? <><RefreshCw size={18} className="spin-icon" /> Processing...</> : <><ScanText size={18} /> Run Diagnostics</>}
          </button>
        </div>
      </div>

      <div className="doc-review-layout">
        
        {/* Left Side: Editor */}
        <div className="glass-panel editor-panel">
          <div className="panel-header">
            <h3><FileText size={18}/> Input Buffer</h3>
            {text.length > 0 && <span className="word-count">{text.trim().split(/\s+/).length} words</span>}
          </div>
          <textarea 
            className="doc-textarea cyber-input" 
            placeholder="Paste document text here for J.A.R.V.I.S network analysis..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>

        {/* Right Side: Analysis */}
        <div className="glass-panel analysis-panel">
          <div className="panel-header">
            <h3><Layers size={18}/> Telemetry & Analysis</h3>
          </div>

          {!isScanning && !results && (
            <div className="empty-state">
              <ScanText size={48} color="#00d2ff" style={{opacity: 0.5, marginBottom: '20px'}}/>
              <h2>Awaiting Document</h2>
              <p>Paste text into the buffer and run diagnostics to receive AI feedback.</p>
            </div>
          )}

          {isScanning && (
            <div className="scanning-state">
              <div className="scanner-line"></div>
              <div className="hologram-loader">
                <div className="circle-inner"></div>
                <div className="circle-outer"></div>
              </div>
              <h3 className="pulse-text">Analyzing linguistic patterns...</h3>
            </div>
          )}

          {results && (
            <div className="results-state slide-in">
              <div className="score-header">
                <div className="score-circle">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle" strokeDasharray={`${results.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <text x="18" y="20.35" className="percentage">{results.score}%</text>
                  </svg>
                </div>
                <div className="score-details">
                  <div className="detail-item"><span>Readability:</span> <span className="text-gradient">{results.readability}</span></div>
                  <div className="detail-item"><span>Tone:</span> <span className="text-gradient">{results.tone}</span></div>
                </div>
              </div>

              <div className="issues-list">
                <h4>Detected Anomalies</h4>
                {results.issues.map((issue, idx) => (
                  <div key={idx} className="issue-item">
                    <div className="issue-icon">
                      {issue.type === 'grammar' ? <CheckCircle2 size={16} color="#10b981"/> : <AlertTriangle size={16} color="#f59e0b"/>}
                    </div>
                    <div className="issue-content">
                      <span className="issue-type">{issue.type.toUpperCase()}</span>
                      <p>{issue.text}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
