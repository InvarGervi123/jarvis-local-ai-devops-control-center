# J.A.R.V.I.S Web Operating System & Chrome Extension 🌐⚡

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.0.0-61dafb.svg?logo=react)
![Node.js](https://img.shields.io/badge/node.js-v18+-green.svg?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb)

Welcome to the **J.A.R.V.I.S** (Synthetic Intelligent Virtual Reactive Assistant J-Core) Web OS! 
This project is an advanced, Iron Man-inspired AI assistant platform that integrates a powerful **Chrome Extension** with a **Node.js/Express Backend** and a beautiful **React (Vite) Dashboard**.

## 🌟 Features

- **Chrome Extension Integration:** Highlight text on any website and instantly Summarize, Explain, or Rewrite it using AI.
- **Node.js Custom Backend:** All API keys (Google Gemini) are hidden securely in the server environment. No BYOK required in the client!
- **JWT Authentication:** Secure token-based authentication.
- **MongoDB Atlas Database:** All conversations and queries are securely synced and stored.
- **Futuristic UI/UX:** Glassmorphism, neon highlights, Recharts for analytics, and Lucide React icons.
- **Real-Time Analytics:** Track your tokens expended, time saved, and weekly AI throughput.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, CSS (Variables/Glassmorphism), React Router, Recharts, Lucide-React
- **Backend:** Node.js, Express, Mongoose, JSONWebToken, BcryptJS
- **Database:** MongoDB Atlas (Cloud)
- **AI Core:** Google Generative AI (`gemini-2.5-flash`)
- **Extension:** Manifest V3, Service Workers, Content Scripts

---

## 🚀 Quick Start Guide

### 1. Database & Environment Setup
Navigate to the `server` folder and configure your environment variables.
```bash
cd server
npm install
```
Edit the `server/.env` file with your credentials:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.exmple.mongodb.net/jarvis?retryWrites=true&w=majority
GEMINI_API_KEY=AIzaSy...
```

### 2. Start the Backend Server
Make sure you are in the `/server` directory:
```bash
npm run dev
```
*(You should see `✅ MongoDB connected via Mongoose` in the console).*

### 3. Start the Frontend Dashboard
Open a second terminal, navigate to the root directory, and run the React app:
```bash
npm install
npm run dev
```
*(The app will start on `http://localhost:5173`)*

### 4. Install the Chrome Extension
1. Open Google Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode** (top right corner).
3. Click **Load unpacked** and select the `/extension` folder from this project.
4. Pin the **J.A.R.V.I.S** extension to your toolbar.

---

## 💡 How It Works (The Data Flow)

1. **Login:** Register/Login on `localhost:5173`. The system gives you a secure JWT token.
2. **Auto-Sync:** A hidden content script automatically sends your token to the Chrome Extension's background storage.
3. **Analyze:** Highlight text on Wikipedia (or any site), right-click, or use the extension popup to click "Summarize".
4. **Proxy:** The extension sends a request to `localhost:5000/api/ai/process` with your JWT.
5. **AI Processing:** The Node server securely asks Google Gemini for the answer.
6. **Storage:** The server saves the prompt and response into MongoDB under your User ID.
7. **Review:** Open your Dashboard (`/conversations` or `/analytics`) to view your synced history in real-time!

---

## 🔒 Security

This architecture successfully bypasses the need for client-side Firebase billing constraints. The Google Gemini API key is *never* exposed to the browser. All AI processing acts through the Node.js reverse proxy.

## 📝 License
Proprietary / Closed Source. Created for the J.A.R.V.I.S initiative.
