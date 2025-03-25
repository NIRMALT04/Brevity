document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const chatContainer = document.getElementById('chat-container');
  const promptInput = document.getElementById('prompt-input');
  const sendBtn = document.getElementById('send-btn');
  
  // Mode Buttons
  const summarizeMode = document.getElementById('summarize-mode');
  const analyzeMode = document.getElementById('analyze-mode');
  const generateMode = document.getElementById('generate-mode');

  // Current Mode State
  let currentMode = 'default';

  // OpenAI Configuration
  const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
  const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

  // Utility Functions
  function renderMarkdown(text) {
      return text
          .replace(/```([\s\S]*?)```/g, (match, code) => 
              `<div class="code-block">${escapeHtml(code)}</div>`)
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>');
  }

  function escapeHtml(unsafe) {
      return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
  }

  function addMessage(content, isUser = false) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', isUser ? 'user-message' : 'ai-message');
      messageElement.innerHTML = isUser ? escapeHtml(content) : renderMarkdown(content);
      chatContainer.appendChild(messageElement);
      chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Mode Selection
  function setMode(mode) {
      currentMode = mode;
      [summarizeMode, analyzeMode, generateMode].forEach(btn => 
          btn.classList.remove('ring-2', 'ring-offset-2')
      );
      document.getElementById(`${mode}-mode`).classList.add('ring-2', 'ring-offset-2');
  }

  // AI Interaction
  async function interactWithAI(userPrompt) {
      const systemPrompts = {
          'summarize': "You are an expert at creating concise, clear summaries of web content. Provide a structured, bullet-point summary.",
          'analyze': "You are a deep analytical assistant who provides comprehensive insights into text, focusing on structure, tone, and key themes.",
          'generate': "You are a versatile code and content generation assistant who provides clean, well-documented solutions.",
          'default': "You are a helpful AI assistant ready to help with various tasks."
      };

      try {
          const response = await fetch(OPENAI_API_ENDPOINT, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${OPENAI_API_KEY}`
              },
              body: JSON.stringify({
                  model: "gpt-3.5-turbo",
                  messages: [
                      { role: "system", content: systemPrompts[currentMode] || systemPrompts['default'] },
                      { role: "user", content: userPrompt }
                  ],
                  max_tokens: 300
              })
          });

          if (!response.ok) throw new Error('API request failed');
          const data = await response.json();
          return data.choices[0].message.content;
      } catch (error) {
          return `Error: ${error.message}`;
      }
  }

  // Event Listeners
  sendBtn.addEventListener('click', async () => {
      const userPrompt = promptInput.value.trim();
      if (!userPrompt) return;
      addMessage(userPrompt, true);
      promptInput.value = '';
      const aiResponse = await interactWithAI(userPrompt);
      addMessage(aiResponse);
  });

  // Mode button listeners
  summarizeMode.addEventListener('click', () => setMode('summarize'));
  analyzeMode.addEventListener('click', () => setMode('analyze'));
  generateMode.addEventListener('click', () => setMode('generate'));

  // Input event listener for Enter key
  promptInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });

  // Initialize with default mode
  setMode('default');
});
