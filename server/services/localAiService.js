const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4';

/**
 * Verifies if Ollama is running and checks if the configured model is pulled.
 * @returns {Promise<{connected: boolean, modelExists: boolean, error?: string}>}
 */
async function checkOllamaHealth() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!res.ok) {
      return { 
        connected: false, 
        modelExists: false, 
        error: `Ollama service returned status ${res.status}` 
      };
    }
    const data = await res.json();
    const models = data.models || [];
    
    const targetModel = OLLAMA_MODEL.toLowerCase();
    const modelExists = models.some(m => {
      const name = m.name.toLowerCase();
      return name === targetModel || name === `${targetModel}:latest` || name.startsWith(targetModel + ':');
    });

    if (!modelExists) {
      return { 
        connected: true, 
        modelExists: false, 
        error: `Configured model '${OLLAMA_MODEL}' was not found. Run 'ollama pull ${OLLAMA_MODEL}' to install it.`
      };
    }

    return { connected: true, modelExists: true };
  } catch (err) {
    return { 
      connected: false, 
      modelExists: false, 
      error: `Ollama is unreachable at ${OLLAMA_BASE_URL}. Ensure Ollama is running locally. Error: ${err.message}` 
    };
  }
}

/**
 * Sends a generation request to the local Ollama instance.
 * @param {object} params
 * @param {string} [params.systemPrompt]
 * @param {string} params.prompt
 * @param {string[]} [params.images] - Base64 encoded image strings (without data URL prefix)
 * @param {boolean} [params.formatJson] - Force JSON response format
 * @returns {Promise<string>}
 */
async function generateResponse({ systemPrompt, prompt, images, formatJson }) {
  // Check health first to ensure Ollama is running and model exists
  const health = await checkOllamaHealth();
  if (!health.connected) {
    console.error(`[AI Service Connection Error] ${health.error}`);
    throw new Error(health.error);
  }
  if (!health.modelExists) {
    console.error(`[AI Service Model Error] ${health.error}`);
    throw new Error(health.error);
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  const userMessage = { role: 'user', content: prompt };
  if (images && images.length > 0) {
    userMessage.images = images;
  }
  messages.push(userMessage);

  const requestBody = {
    model: OLLAMA_MODEL,
    messages,
    stream: false,
    options: {
      temperature: 0.2
    }
  };

  if (formatJson) {
    requestBody.format = 'json';
  }

  console.log(`[AI Request] Connecting to local Ollama. Provider: ollama | URL: ${OLLAMA_BASE_URL} | Model: ${OLLAMA_MODEL}`);
  const startTime = Date.now();

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errText}`);
    }

    const result = await response.json();
    const duration = Date.now() - startTime;
    console.log(`[AI Response] Successfully received response from Ollama in ${duration}ms`);

    return result.message.content;
  } catch (err) {
    console.error(`[AI Service Request Failed] Reason: ${err.message}`);
    throw err;
  }
}

module.exports = {
  checkOllamaHealth,
  generateResponse,
  OLLAMA_MODEL,
  OLLAMA_BASE_URL
};
