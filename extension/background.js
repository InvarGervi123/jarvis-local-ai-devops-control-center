// Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('J.A.R.V.I.S Extension Installed');
  
  // Create Context Menu for quick action without opening popup
  chrome.contextMenus.create({
    id: "sivraj-analyze",
    title: "J.A.R.V.I.S Analyze",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sivraj-analyze") {
    // We would inject our CSS/JS to show an inline tooltip here in the future
    console.log("Analyze clicked for:", info.selectionText);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Catch the token from the React Web App
  if (request.action === "sync_token") {
    chrome.storage.local.set({ appToken: request.token });
    return false;
  }

  if (request.action === "processAI") {
    const { type, text } = request;
    
    // Retrieve the synced token and personal API key from local storage
    chrome.storage.local.get(['appToken', 'geminiApiKey'], (result) => {
      const token = result.appToken || "";
      const personalKey = result.geminiApiKey || "";

      const API_BASE_URL = 'http://localhost:5000'; // Change to production URL before deploying (e.g. https://api.jarvis.com)

      // Call the local Node.js backend which safely manages the API Key and MongoDB
      fetch(`${API_BASE_URL}/api/ai/process`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token, // Send auth token if user is logged into the Jarvis website
          "x-gemini-key": personalKey // Send user's personal API key if configured
        },
        body: JSON.stringify({ type, text })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success === false || data.msg) {
           throw new Error(data.msg || data.data || "Unknown server error");
        }
        sendResponse({ success: true, data: data.data });
      })
      .catch(error => {
        console.error("Backend API Error:", error);
        sendResponse({ success: false, data: "Error connecting to Server: " + error.message });
      });
    });
    
    return true; // Keep the message channel open for the async response
  }
});
