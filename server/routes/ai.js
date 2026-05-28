const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require("groq-sdk");
const fs = require("fs");
const os = require("os");
const path = require("path");

const localAiService = require('../services/localAiService');

// POST /api/ai/process
// Request from Chrome Extension or Web App
router.post('/process', auth, async (req, res) => {
  const { type, text } = req.body;
  const language = "hebrew"; // Could read from user settings

  if (type === "transcribe") {
    console.log("[AI Route] Transcription requested but audio feature is disabled in local mode.");
    return res.status(400).json({
      success: false,
      data: "Audio mode is currently disabled because this version uses one local AI model only."
    });
  }

  let prompt = "";
  let formatJson = false;

  if (type === "summarize") {
    prompt = `Summarize the following text in ${language}, keep it concise:\n\n${text}`;
  } else if (type === "explain") {
    prompt = `Explain the following text in ${language} simply, as if to a beginner:\n\n${text}`;
  } else if (type === "rewrite") {
    prompt = `Rewrite the following text in ${language} to sound more professional and clear:\n\n${text}`;
  } else if (type === "review") {
    formatJson = true;
    prompt = `Act as an expert copywriter. Analyze the following text and return ONLY a valid JSON object without any markdown wrapping. The JSON must have the following structure:
    {
      "score": <number between 0 and 100 representing overall quality>,
      "readability": <string, e.g. "Advanced", "Intermediate", "Basic">,
      "tone": <string, e.g. "Professional", "Casual", "Urgent">,
      "issues": [
        { "type": "grammar" | "style" | "clarity", "text": "<short description of issue>" }
      ]
    }
    
    Text to analyze:
    ${text}`;
  } else if (type === "vision") {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, data: "No image provided" });
    
    // image is expected to be a data URL: "data:image/jpeg;base64,/9j/4AAQ..."
    let base64Data = "";
    try {
      base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    } catch (e) {
      return res.status(400).json({ success: false, data: "Invalid image format" });
    }

    const visionPrompt = `You are an expert UX/UI designer. Analyze this screenshot of a user interface. Return ONLY a valid JSON object without any markdown wrapping. The JSON must have the following structure:
    {
      "elements": <estimated number of distinct UI elements, integer>,
      "contrastIssues": <number of potential contrast issues, integer>,
      "alignmentScore": <number between 0 and 100 representing layout alignment>,
      "findings": [
        { "type": "Accessibility" | "Layout" | "UI Component", "title": "<short title>", "desc": "<description of finding>", "isWarning": <boolean> }
      ]
    }`;

    try {
      const aiResponseText = await localAiService.generateResponse({
        prompt: visionPrompt,
        images: [base64Data],
        formatJson: true
      });

      const newConversation = new Conversation({
        userId: req.user.id,
        actionType: type,
        selectedText: "[Image Analysis Request]",
        aiResponse: aiResponseText
      });
      await newConversation.save();

      return res.json({ success: true, data: aiResponseText });
    } catch (err) {
      console.error("[AI Route Error] Vision processing failed:", err.message);
      return res.status(400).json({
        success: false,
        data: "Image analysis is not supported by the current local setup/model. Please ensure you are running a vision-capable local model (e.g. llava)."
      });
    }
  } else {
    return res.status(400).json({ success: false, data: "Invalid action type" });
  }

  try {
    const aiResponseText = await localAiService.generateResponse({
      systemPrompt: "You are J.A.R.V.I.S, an advanced local AI assistant.",
      prompt,
      formatJson
    });

    const newConversation = new Conversation({
      userId: req.user.id,
      actionType: type,
      selectedText: text,
      aiResponse: aiResponseText
    });
    await newConversation.save();

    res.json({ success: true, data: aiResponseText });
  } catch (err) {
    console.error("[AI Route Error] Processing failed:", err.message);
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
