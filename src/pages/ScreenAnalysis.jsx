import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, ScanEye, LayoutDashboard, Target, Crosshair } from 'lucide-react';
import './ScreenAnalysis.css';

export default function ScreenAnalysis() {
  const [image, setImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
      setResults(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
      setResults(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const runAnalysis = () => {
    if (!image) return;
    setIsScanning(true);
    setResults(null);

    // Simulate AI Vision Analysis
    setTimeout(() => {
      setIsScanning(false);
      setResults({
        elements: 42,
        contrastIssues: 3,
        alignmentScore: 94,
        findings: [
          { type: 'UI Component', title: 'Navigation Bar', desc: 'Optimal spacing detected. Standard header height.' },
          { type: 'Accessibility', title: 'Low Contrast', desc: 'Button text (#777) on dark background fails WCAG AA standards.', isWarning: true },
          { type: 'Layout', title: 'Alignment Deviation', desc: 'Hero image is off-center by 12px relative to text block.', isWarning: true }
        ]
      });
    }, 3000);
  };

  return (
    <div className="page-wrapper screen-analysis-page">
      <div className="header-bar">
        <h1 className="page-title text-gradient">J.A.R.V.I.S Vision Analysis</h1>
        <div className="header-actions">
          {image && <button className="btn-secondary" onClick={() => {setImage(null); setResults(null);}}>Clear Image</button>}
          <button className="btn-primary" onClick={runAnalysis} disabled={isScanning || !image}>
            {isScanning ? <><ScanEye size={18} className="pulse-icon"/> Analyzing...</> : <><Target size={18} /> Scan UI</>}
          </button>
        </div>
      </div>

      <div className="vision-layout">
        
        {/* Left Side: Upload / Image View */}
        <div className="glass-panel canvas-panel">
          {!image ? (
            <div 
              className="upload-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{display: 'none'}} 
                accept="image/*"
                onChange={handleImageUpload}
              />
              <UploadCloud size={64} className="upload-icon" />
              <h3>Upload UI Screenshot</h3>
              <p>Drag and drop an image, or click to browse</p>
            </div>
          ) : (
            <div className="image-container">
              <img src={image} alt="UI Screenshot" className="uploaded-image" />
              {isScanning && (
                <div className="scanning-overlay">
                  <div className="scan-bar"></div>
                  <Crosshair size={100} className="target-reticle" />
                </div>
              )}
              {results && (
                <div className="bounding-boxes">
                  <div className="box box-1"></div>
                  <div className="box box-2"></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Diagnostics */}
        <div className="glass-panel diagnostics-panel">
          <div className="panel-header">
            <h3><LayoutDashboard size={18}/> Optical Telemetry</h3>
          </div>

          {!isScanning && !results && (
            <div className="empty-state">
              <ImageIcon size={48} color="#00d2ff" style={{opacity: 0.5, marginBottom: '20px'}}/>
              <h2>Awaiting Visual Data</h2>
              <p>Upload a screenshot for J.A.R.V.I.S to analyze layout, contrast, and UX anomalies.</p>
            </div>
          )}

          {isScanning && (
            <div className="scanning-state">
              <div className="matrix-loader">
                {[...Array(9)].map((_, i) => <div key={i} className="matrix-dot"></div>)}
              </div>
              <h3 className="pulse-text">Running pixel density analysis...</h3>
            </div>
          )}

          {results && (
            <div className="results-state slide-in">
              <div className="metrics-grid">
                <div className="metric-box">
                  <div className="metric-value">{results.alignmentScore}%</div>
                  <div className="metric-label">Alignment</div>
                </div>
                <div className="metric-box">
                  <div className="metric-value">{results.elements}</div>
                  <div className="metric-label">Elements</div>
                </div>
                <div className="metric-box warning">
                  <div className="metric-value">{results.contrastIssues}</div>
                  <div className="metric-label">Contrast Issues</div>
                </div>
              </div>

              <div className="findings-list">
                <h4>System Findings</h4>
                {results.findings.map((finding, idx) => (
                  <div key={idx} className={`finding-item ${finding.isWarning ? 'warning-item' : 'nominal-item'}`}>
                    <div className="finding-header">
                      <span className="finding-type">{finding.type}</span>
                      {finding.isWarning && <span className="warning-badge">Alert</span>}
                    </div>
                    <h5>{finding.title}</h5>
                    <p>{finding.desc}</p>
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
