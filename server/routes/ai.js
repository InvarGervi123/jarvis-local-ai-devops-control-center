const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// POST /api/ai/process
// Request from Chrome Extension (requires JWT Auth token synced from Jarvis Web App)
router.post('/process', auth, async (req, res) => {
  const { type, text } = req.body;
  const language = "hebrew"; // Could read from user settings

  // Hybrid BYOK Logic: Use personal key from extension header, or fallback to server env
  const apiKeyToUse = req.header('x-gemini-key') || process.env.GEMINI_API_KEY;
  if (!apiKeyToUse) {
    return res.status(400).json({ success: false, data: "Please configure your Gemini API Key in the extension settings." });
  }

  const dynamicGenAI = new GoogleGenerativeAI(apiKeyToUse);

  let prompt = "";
  if (type === "summarize") {
    prompt = `Summarize the following text in ${language}, keep it concise:\n\n${text}`;
  } else if (type === "explain") {
    prompt = `Explain the following text in ${language} simply, as if to a beginner:\n\n${text}`;
  } else if (type === "rewrite") {
    prompt = `Rewrite the following text in ${language} to sound more professional and clear:\n\n${text}`;
  } else {
    return res.status(400).json({ success: false, data: "Invalid action type" });
  }

  try {
    const model = dynamicGenAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponseText = response.text();

    // Securely save into MongoDB
    const newConversation = new Conversation({
      userId: req.user.id,
      actionType: type,
      selectedText: text,
      aiResponse: aiResponseText
    });

    await newConversation.save();

    res.json({ success: true, data: aiResponseText });
  } catch (err) {
    console.error("Gemini API backend error:", err);
    res.status(500).json({ success: false, data: "Backend AI Processing Error: " + err.message });
  }
});

// GET /api/ai/history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Conversation.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE /api/ai/history/:id
router.delete('/history/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    // Security check
    if (conversation.userId.toString() !== req.user.id) {
       return res.status(401).json({ msg: 'User not authorized to delete this log' });
    }

    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Conversation removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
