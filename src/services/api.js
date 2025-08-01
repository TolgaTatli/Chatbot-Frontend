// API Base URL
const API_BASE = 'http://localhost:8000';

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Chat API
export const chatAPI = {
  // Streaming API
  streamingRequest: async (message, topK, userId, onChunk) => {
    return new Promise((resolve, reject) => {
      const requestBody = JSON.stringify({
        question: message,
        top_k: topK,
        user_id: userId || null
      });

      fetch(`${API_BASE}/generate-stream`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: requestBody,
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullAnswer = '';

        const processStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              resolve();
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'start') {
                    console.log('Streaming yanıt başladı...');
                  } 
                  else if (data.type === 'chunk') {
                    fullAnswer += data.text;
                    if (onChunk) {
                      onChunk(fullAnswer);
                    }
                  } 
                  else if (data.type === 'error') {
                    reject(new Error(data.message || 'Streaming hatası'));
                    return;
                  }
                } catch (e) {
                  console.warn('JSON parse hatası:', e, 'Line:', line);
                }
              }
            }

            processStream();
          }).catch(reject);
        };

        processStream();
      })
      .catch(reject);
    });
  },

  // Normal API (fallback)
  normalRequest: async (message, topK, userId) => {
    const response = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question: message,
        top_k: topK,
        user_id: userId || null
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let responseText = data.answer || "Yanıt alınamadı";

    // Ollama hatası kontrolü
    if (responseText.includes("Ollama hatası: 500")) {
      responseText = "🔧 Model yükleme hatası. RAG sistemi çalışıyor ancak AI modeli yüklenemiyor. Lütfen sistem yöneticisine başvurun veya birkaç dakika bekleyip tekrar deneyin.";
    }

    if (!responseText || responseText.length < 10) {
      responseText = "Yanıt oluşturulamadı, lütfen soruyu yeniden deneyin.";
    }

    return responseText;
  },

  // Test connection
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Get RAG status
  getRAGStatus: async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      const status = await response.json();
      return {
        system: status.rag_system,
        ollama: status.ollama_status,
        documents: status.document_count,
        model: status.model
      };
    } catch (error) {
      return {
        system: 'error',
        ollama: 'error',
        documents: 0,
        model: 'unknown'
      };
    }
  }
};

// Conversations API
export const conversationsAPI = {
  // Get all conversations
  getAll: async () => {
    const response = await fetch(`${API_BASE}/history`, {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      return data.conversations || [];
    }
    return [];
  },

  // Get conversation by ID
  getById: async (conversationId) => {
    const response = await fetch(`${API_BASE}/history/${conversationId}`, {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      return data.conversation;
    }
    return null;
  },

  // Delete conversation
  delete: async (conversationId) => {
    const response = await fetch(`${API_BASE}/history/${conversationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    return response.ok;
  }
};
