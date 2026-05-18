import React, { useState, useRef } from 'react';
import { Mic, Play, Pause, Square, Volume2, FileText, Activity, Clock, StopCircle } from 'lucide-react';
import './Recordings.css';

export default function Recordings() {
  const [activeRecording, setActiveRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState(null);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [localRecordings, setLocalRecordings] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const formatDuration = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingSeconds(0);
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        clearInterval(timerRef.current);
        const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result;
          const newRec = {
            id: Date.now(),
            title: `Audio Log ${localRecordings.length + 1}`,
            date: new Date().toLocaleDateString(),
            duration: formatDuration(finalDuration), 
            size: `${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`,
            base64: base64data
          };
          setLocalRecordings(prev => [newRec, ...prev]);
        };

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start Timer for UI
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Error accessing microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handlePlay = (rec) => {
    setActiveRecording(rec);
    setIsPlaying(true);
    setTranscription(null);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTranscribe = async () => {
    if (!activeRecording || !activeRecording.base64) return;
    setIsTranscribing(true);
    setTranscription(null);

    try {
      const token = localStorage.getItem('token');
      const geminiKey = localStorage.getItem('gemini_api_key') || '';
      const groqKey = localStorage.getItem('groq_api_key') || '';
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const res = await fetch(`${API_URL}/api/ai/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
          'x-gemini-key': geminiKey,
          'x-groq-key': groqKey
        },
        body: JSON.stringify({ type: 'transcribe', audio: activeRecording.base64 })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.msg || data.data || 'Failed to transcribe audio');
      
      let parsedResults;
      try {
        const cleanJsonString = data.data.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResults = JSON.parse(cleanJsonString);
      } catch (parseError) {
        throw new Error('AI returned an invalid format. Please try again.');
      }

      setTranscription(parsedResults);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="page-wrapper recordings-page">
      <div className="header-bar">
        <h1 className="page-title text-gradient">Audio Surveillance & Logs</h1>
        <div className="header-actions">
          <button 
            className={`btn-primary ${isRecording ? 'recording-pulse' : ''}`} 
            onClick={isRecording ? stopRecording : startRecording}
            style={isRecording ? { background: 'rgba(255, 50, 50, 0.2)', borderColor: 'rgba(255, 50, 50, 0.8)', color: '#ff4444', boxShadow: '0 0 20px rgba(255, 50, 50, 0.4)' } : {}}
          >
            {isRecording ? <><StopCircle size={18} className="pulse-icon" /> Stop Recording ({recordingSeconds}s)</> : <><Mic size={18} /> Initialize Recording</>}
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
            {localRecordings.length === 0 && <p style={{color: '#8b9bb4', padding: '1rem'}}>No local recordings. Click Initialize Recording to start.</p>}
            {localRecordings.map(rec => (
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
              {/* Audio Visualizer / Player */}
              <div className="audio-visualizer" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="visualizer-header">
                  <span className="rec-title">{activeRecording.title}</span>
                  <span className="rec-time">{activeRecording.duration}</span>
                </div>
                
                <div className="waveform-container" style={{ margin: '15px 0' }}>
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
                  <div className="progress-line"></div>
                </div>

                <div className="real-audio-player">
                  <audio 
                    controls 
                    src={activeRecording.base64} 
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                  />
                </div>

                <div className="player-controls" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <a 
                    href={activeRecording.base64} 
                    download={`jarvis-log-${activeRecording.id}.webm`}
                    className="btn-secondary"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Volume2 size={16}/> Download Audio
                  </a>

                  <button 
                    className="btn-primary transcribe-btn" 
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                    style={{ flex: 1, marginLeft: '15px' }}
                  >
                    <FileText size={16}/> {isTranscribing ? 'Processing AI...' : 'Transcribe AI'}
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
