const API_BASE = 'http://localhost:8000';

// Auth error handling
const handleAuthError = () => {
  console.log('🔄 Token süresi dolmuş, çıkış yapılıyor...');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  
  // Token süresi doldu toast'ı - Dinamik import kullan
  import('react-toastify').then(({ toast }) => {
    toast.warning('Oturum süreniz doldu. Tekrar giriş yapınız! ⏰', {
      position: "top-right",
      autoClose: 4000,
    });
  });
  
  window.dispatchEvent(new CustomEvent('authError'));
  setTimeout(() => window.location.reload(), 1000); // Toast'ın görünmesi için kısa bekleme
};

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
export const chatAPI = {
  streamingRequest: async (message, topK, userId, threadId, onChunk, onConversationSaved) => {
    return new Promise((resolve, reject) => {
      const requestBody = JSON.stringify({
        question: message,
        top_k: topK,
        user_id: userId || null,
        ...(threadId && { thread_id: threadId }) // Thread ID varsa ekle
      });
      
      let streamingData = {
        answer: '',
        conversationSaved: false,
        conversationId: null,
        threadId: null,
        sources: [],
        confidence: 0,
        method: 'unknown'
      };
      
      fetch(`${API_BASE}/generate-stream`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: requestBody,
      })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            handleAuthError();
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullAnswer = '';
        
        const processStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              resolve(streamingData);
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
                    streamingData.answer = fullAnswer;
                    if (onChunk) {
                      onChunk(fullAnswer);
                    }
                  }
                  else if (data.type === 'end') {
                    // End event'inde conversation bilgilerini al
                    streamingData.sources = data.sources || [];
                    streamingData.confidence = data.confidence || 0;
                    streamingData.method = data.method || 'unknown';
                    streamingData.conversationSaved = data.conversation_saved || false;
                    streamingData.conversationId = data.conversation_id || null;
                    streamingData.threadId = data.thread_id || null;
                    
                    // Debug: End event'ini logla
                    console.log('🔍 Stream End Event Data:', {
                      type: data.type,
                      conversation_saved: data.conversation_saved,
                      conversation_id: data.conversation_id,
                      thread_id: data.thread_id,
                      user_authenticated: data.user_authenticated,
                      fullData: data
                    });
                    
                    // Thread kaydedildiyse callback'i çağır
                    if (streamingData.conversationSaved && onConversationSaved) {
                      console.log('✅ Calling onConversationSaved with Thread ID:', streamingData.threadId);
                      onConversationSaved(streamingData.threadId, streamingData.conversationId);
                    } else {
                      console.warn('❌ Conversation not saved or no callback. Saved:', streamingData.conversationSaved, 'Callback:', !!onConversationSaved);
                    }
                    
                    console.log('Streaming tamamlandı, conversation:', streamingData.conversationSaved ? 'kaydedildi' : 'kaydedilmedi');
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
  normalRequest: async (message, topK, userId, threadId) => {
    const response = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question: message,
        top_k: topK,
        user_id: userId || null,
        ...(threadId && { thread_id: threadId })
      }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        handleAuthError();
        return {};
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    let responseText = data.answer || "Yanıt alınamadı";
    
    if (responseText.includes("Ollama hatası: 500")) {
      responseText = "🔧 Model yükleme hatası. RAG sistemi çalışıyor ancak AI modeli yüklenemiyor. Lütfen sistem yöneticisine başvurun veya birkaç dakika bekleyip tekrar deneyin.";
    }
    
    if (!responseText || responseText.length < 10) {
      responseText = "Yanıt oluşturulamadı, lütfen soruyu yeniden deneyin.";
    }
    
    // Normal request için de conversation bilgilerini döndür
    return {
      answer: responseText,
      conversationSaved: data.conversation_saved || false,
      conversationId: data.conversation_id || null,
      threadId: data.thread_id || null,
      sources: data.sources || [],
      confidence: data.confidence || 0,
      method: data.method || 'unknown'
    };
  },
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },
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
export const conversationsAPI = {
  // Eski endpoint'ler (geriye uyumluluk için)
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
  
  getLatest: async (limit = 5) => {
    const response = await fetch(`${API_BASE}/history/latest?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    if (response.ok) {
      const data = await response.json();
      return data.conversations || [];
    }
    return [];
  },
  
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
  
  delete: async (conversationId) => {
    const response = await fetch(`${API_BASE}/history/${conversationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.ok;
  }
};

// Yeni Threading API
export const threadsAPI = {
  // Thread listesi al
  getAll: async () => {
    const response = await fetch(`${API_BASE}/threads`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 401) {
        handleAuthError();
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.threads || [];
  },
  
  // Belirli thread'in tüm mesajları
  getMessages: async (threadId) => {
    const response = await fetch(`${API_BASE}/threads/${threadId}/messages`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 401) {
        handleAuthError();
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.messages || [];
  },
  
  // Thread sil
  delete: async (threadId) => {
    const response = await fetch(`${API_BASE}/threads/${threadId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok && response.status === 401) {
      handleAuthError();
      return false;
    }
    return response.ok;
  }
};
