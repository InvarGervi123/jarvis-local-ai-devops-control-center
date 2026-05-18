const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require("groq-sdk");
const fs = require("fs");
const os = require("os");
const path = require("path");

// POST /api/ai/process
// Request from Chrome Extension (requires JWT Auth token synced from Jarvis Web App)
router.post('/process', auth, async (req, res) => {
  const { type, text } = req.body;
  const language = "hebrew"; // Could read from user settings

  // Strict BYOK Logic: The user must provide their own key via the extension or web app settings.
  const apiKeyToUse = req.header('x-gemini-key');
  if (!apiKeyToUse) {
    return res.status(400).json({ success: false, data: "Please configure your Gemini API Key in the settings." });
  }

  const dynamicGenAI = new GoogleGenerativeAI(apiKeyToUse);

  let prompt = "";
  let imageParts = [];

  if (type === "summarize") {
    prompt = `Summarize the following text in ${language}, keep it concise:\n\n${text}`;
  } else if (type === "explain") {
    prompt = `Explain the following text in ${language} simply, as if to a beginner:\n\n${text}`;
  } else if (type === "rewrite") {
    prompt = `Rewrite the following text in ${language} to sound more professional and clear:\n\n${text}`;
  } else if (type === "review") {
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
    const mimeType = image.match(/data:([^;]+);/)[1];
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      }
    ];

    prompt = `You are an expert UX/UI designer. Analyze this screenshot of a user interface. Return ONLY a valid JSON object without any markdown wrapping. The JSON must have the following structure:
    {
      "elements": <estimated number of distinct UI elements, integer>,
      "contrastIssues": <number of potential contrast issues, integer>,
      "alignmentScore": <number between 0 and 100 representing layout alignment>,
      "findings": [
        { "type": "Accessibility" | "Layout" | "UI Component", "title": "<short title>", "desc": "<description of finding>", "isWarning": <boolean> }
      ]
    }`;
  } else if (type === "transcribe") {
    const { audio } = req.body;
    if (!audio) return res.status(400).json({ success: false, data: "No audio provided" });
    
    const groqKey = req.header('x-groq-key');
    if (!groqKey) return res.status(400).json({ success: false, data: "Please configure your Groq API Key in settings." });
    
    const [header, base64Data] = audio.split('base64,');
    if (!base64Data) return res.status(400).json({ success: false, data: "Invalid audio format" });
    
    try {
      // Create temp file for Groq Whisper
      const buffer = Buffer.from(base64Data, 'base64');
      const tempFilePath = path.join(os.tmpdir(), `audio_${Date.now()}.webm`);
      fs.writeFileSync(tempFilePath, buffer);

      const groq = new Groq({ apiKey: groqKey });
      
      // 1. Audio to Text via Whisper
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-large-v3",
        response_format: "json",
      });
      
      fs.unlinkSync(tempFilePath); // Cleanup temp file
      
      // 2. Format with Llama 3.1
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are an expert transcriber. Extract keywords and estimate confidence. Return ONLY a valid JSON object without any markdown wrapping: {\"text\": \"<exact original text>\", \"confidence\": 95, \"keywords\": [\"kw1\", \"kw2\"]}" },
          { role: "user", content: `Format this transcription: ${transcription.text}` }
        ],
        model: "llama-3.1-8b-instant",
      });

      const aiResponseText = completion.choices[0].message.content;

      // Save to MongoDB
      const newConversation = new Conversation({
        userId: req.user.id,
        actionType: type,
        selectedText: "[Audio Transcription Request]",
        aiResponse: aiResponseText
      });
      await newConversation.save();

      return res.json({ success: true, data: aiResponseText });
    } catch (err) {
      console.error("Groq Processing Error:", err);
      return res.status(500).json({ success: false, data: "Groq AI Processing Error: " + err.message });
    }
  } else {
    return res.status(400).json({ success: false, data: "Invalid action type" });
  }

  try {
    const model = dynamicGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // If it's a vision or audio request, pass the parts and the prompt as an array
    const requestPayload = (type === "vision" || type === "transcribe") ? [prompt, ...imageParts] : prompt;
    
    const result = await model.generateContent(requestPayload);
    const response = await result.response;
    const aiResponseText = response.text();

    // Securely save into MongoDB (skip saving massive base64 files to DB)
    let safeSelectedText = text;
    if (type === "vision") safeSelectedText = "[Image Analysis Request]";
    if (type === "transcribe") safeSelectedText = "[Audio Transcription Request]";

    const newConversation = new Conversation({
      userId: req.user.id,
      actionType: type,
      selectedText: safeSelectedText,
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
