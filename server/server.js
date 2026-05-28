const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection with Cloud -> Local Fallback
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Cloud (Atlas)...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Cloud (Atlas) connected successfully');
  } catch (cloudErr) {
    console.warn(`⚠️ Cloud DB connection failed (${cloudErr.message}). Falling back to Local MongoDB...`);
    try {
      const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/jarvis';
      await mongoose.connect(localUri);
      console.log('✅ Local MongoDB connected successfully');
    } catch (localErr) {
      console.error('❌ CRITICAL: Both Cloud and Local MongoDB connections failed.', localErr.message);
    }
  }
};
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/admin', require('./routes/admin'));

// GET /api/health (Unauthenticated DevOps Health Check)
app.get('/api/health', async (req, res) => {
  const localAiService = require('./services/localAiService');
  const healthStatus = await localAiService.checkOllamaHealth();
  const logs = {
    status: (healthStatus.connected && healthStatus.modelExists) ? "ok" : "warning",
    service: "backend",
    aiProvider: "ollama",
    model: localAiService.OLLAMA_MODEL,
    ollama: healthStatus.connected ? (healthStatus.modelExists ? "connected" : "model_missing") : "disconnected",
    timestamp: new Date().toISOString()
  };
  
  if (healthStatus.error) {
    logs.error = healthStatus.error;
  }
  
  console.log(`[Health Check Status] Status: ${logs.status.toUpperCase()} | Provider: ${logs.aiProvider} | Model: ${logs.model} | Ollama Connection: ${logs.ollama}`);
  
  res.json(logs);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 J.A.R.V.I.S Local AI DevOps Control Center started successfully on port ${PORT}`);
  console.log(`📡 Selected AI Provider: ollama`);
  const localAiService = require('./services/localAiService');
  console.log(`🤖 Selected Model: ${localAiService.OLLAMA_MODEL}`);
  
  // Verify Ollama connection status on startup
  const health = await localAiService.checkOllamaHealth();
  if (health.connected) {
    if (health.modelExists) {
      console.log(`🟢 Ollama Connection Status: Connected. Model '${localAiService.OLLAMA_MODEL}' is ready.`);
    } else {
      console.warn(`⚠️ Ollama Connection Status: Connected, but model '${localAiService.OLLAMA_MODEL}' is missing. Please run 'ollama pull ${localAiService.OLLAMA_MODEL}'`);
    }
  } else {
    console.error(`🔴 Ollama Connection Status: Disconnected. ${health.error}`);
  }
});
