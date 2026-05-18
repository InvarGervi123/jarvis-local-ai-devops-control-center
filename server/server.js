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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 J.A.R.V.I.S Server running on port ${PORT}`));
