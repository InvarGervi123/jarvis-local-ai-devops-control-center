chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "getSelection") {
    const selection = window.getSelection().toString().trim();
    sendResponse({ selectedText: selection });
  }
});

// If we are on the Jarvis Web OS, sync the token automatically to the extension background
if (window.location.hostname === 'localhost' || window.location.hostname.includes('jarvis')) {
  setInterval(() => {
    const token = window.localStorage.getItem('token');
    if (token) {
      chrome.runtime.sendMessage({ action: "sync_token", token });
    }
  }, 2000);
}
