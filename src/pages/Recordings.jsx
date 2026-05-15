import React, { useState } from 'react';
import { Mic, Play, Pause, Square, Volume2, FileText, Activity, Clock } from 'lucide-react';
import './Recordings.css';

export default function Recordings() {
  const [activeRecording, setActiveRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState(null);

  const mockRecordings = [
    { id: 1, title: 'Project Alpha Debrief', date: 'Oct 24, 2026', duration: '04:12', size: '3.2 MB' },
    { id: 2, title: 'Client Meeting Notes', date: 'Oct 23, 2026', duration: '12:45', size: '8.1 MB' },
    { id: 3, title: 'Personal Log - Stardate 412', date: 'Oct 21, 2026', duration: '02:30', size: '1.5 MB' },
    { id: 4, title: 'Idea: Quantum Encryption', date: 'Oct 18, 2026', duration: '08:05', size: '5.4 MB' },
  ];

  const handlePlay = (rec) => {
    setActiveRecording(rec);
    setIsPlaying(true);
    setTranscription(null);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTranscribe = () => {
    if (!activeRecording) return;
    setIsTranscribing(true);
    setTranscription(null);

    // Simulate AI Transcription
    setTimeout(() => {
      setIsTranscribing(false);
      setTranscription({
        text: "Audio log analysis complete. The subject discussed integrating quantum encryption protocols into the main server branch. Several vulnerabilities were noted in the legacy system, specifically regarding the handshake sequence. Recommendation is to proceed with the J.A.R.V.I.S automated patch.",
        confidence: 98,
        keywords: ['Quantum', 'Encryption', 'J.A.R.V.I.S', 'Vulnerabilities']
      });
    }, 4000);
  };

  return (
    <div className="page-wrapper recordings-page">
      <div className="header-bar">
        <h1 className="page-title text-gradient">Audio Surveillance & Logs</h1>
        <div className="header-actions">
          <button className="btn-primary" style={{backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444', color: '#f87171'}}>
            <Mic size={18} /> Initialize Recording
          </button>
        </div>
      </div>

      <div className="recordings-layout">
        
        {/* Left Side: Recording List */}
        <div className="glass-panel list-panel">
          <div className="panel-header">
            <h3><Clock size={18}/> Encrypted Logs</h3>
          </div>
          <div className="recordings-list">
            {mockRecordings.map(rec => (
              <div 
                key={rec.id} 
                className={`recording-item ${activeRecording?.id === rec.id ? 'active' : ''}`}
                onClick={() => handlePlay(rec)}
              >
                <div className="rec-icon">
                  {activeRecording?.id === rec.id && isPlaying ? <Activity size={20} className="pulse-icon" color="#00d2ff"/> : <Mic size={20} color="#8b9bb4"/>}
                </div>
                <div className="rec-details">
                  <h4>{rec.title}</h4>
                  <span>{rec.date} • {rec.size}</span>
                </div>
                <div className="rec-duration">{rec.duration}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Player & Transcription */}
        <div className="glass-panel player-panel">
          <div className="panel-header">
            <h3><Volume2 size={18}/> Playback Interface</h3>
          </div>

          {!activeRecording ? (
            <div className="empty-state">
              <Mic size={48} color="#00d2ff" style={{opacity: 0.5, marginBottom: '20px'}}/>
              <h2>No Signal Detected</h2>
              <p>Select a recording from the archive to initialize playback and transcription.</p>
            </div>
          ) : (
            <div className="player-content">
              
              {/* Audio Visualizer */}
              <div className="audio-visualizer">
                <div className="visualizer-header">
                  <span className="rec-title">{activeRecording.title}</span>
                  <span className="rec-time">01:23 / {activeRecording.duration}</span>
                </div>
                
                <div className="waveform-container">
                  {/* Generate dummy waveform bars */}
                  {[...Array(40)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`waveform-bar ${isPlaying ? 'animating' : ''}`}
                      style={{ 
                        height: isPlaying ? `${Math.random() * 80 + 20}%` : '10%',
                        animationDelay: `${i * 0.05}s`
                      }}
                    ></div>
                  ))}
                  {/* Progress Line */}
                  <div className="progress-line"></div>
                </div>

                <div className="player-controls">
                  <button className="control-btn"><Square size={20} fill="currentColor" onClick={() => setIsPlaying(false)}/></button>
                  <button className="control-btn primary" onClick={togglePlay}>
                    {isPlaying ? <Pause size={24} fill="currentColor"/> : <Play size={24} fill="currentColor"/>}
                  </button>
                  <button 
                    className="btn-secondary transcribe-btn" 
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                  >
                    <FileText size={16}/> {isTranscribing ? 'Processing...' : 'Transcribe AI'}
                  </button>
                </div>
              </div>

              {/* Transcription Area */}
              <div className="transcription-area">
                {isTranscribing ? (
                  <div className="transcribing-state">
                    <div className="audio-wave-loader">
                      <span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <p className="pulse-text text-gradient">J.A.R.V.I.S converting audio to text matrix...</p>
                  </div>
                ) : transcription ? (
                  <div className="transcription-result slide-in">
                    <div className="transcription-header">
                      <h4><FileText size={16}/> Extracted Text</h4>
                      <span className="confidence-badge">Confidence: {transcription.confidence}%</span>
                    </div>
                    <p className="transcribed-text">{transcription.text}</p>
                    
                    <div className="keywords-container">
                      <span className="keywords-label">Detected Entities:</span>
                      <div className="keywords-list">
                        {transcription.keywords.map((kw, i) => (
                          <span key={i} className="keyword-tag">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="transcription-placeholder">
                    <p>Click "Transcribe AI" to generate a highly accurate text log of this audio via J.A.R.V.I.S Deep Learning models.</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
