import { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { CONNECTION_STATUS } from '../utils/constants';
import { toast } from 'react-toastify';
export const useChat = (user, apiSettings) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hello, I'm your AI assistant. How can I assist you?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showInputGlow, setShowInputGlow] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.CONNECTED);
  const [ragStatus, setRagStatus] = useState({
    system: 'unknown',
    ollama: 'unknown',
    documents: 0,
    model: 'unknown'
  });
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [isCreatingNewThread, setIsCreatingNewThread] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const testConnection = async () => {
    setConnectionStatus(CONNECTION_STATUS.TESTING);
    try {
      const isConnected = await chatAPI.testConnection();
      setConnectionStatus(isConnected ? CONNECTION_STATUS.CONNECTED : CONNECTION_STATUS.DISCONNECTED);
      return isConnected;
    } catch (error) {
      setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      console.error("API Test Failed:", error);
      return false;
    }
  };
  const checkRAGStatus = async () => {
    const status = await chatAPI.getRAGStatus();
    setRagStatus(status);
  };
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    console.log('🚀 Mesaj gönderiliyor - Mevcut Thread ID:', currentThreadId);
    
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    
    const questionText = inputMessage;
    setCurrentQuestion(questionText);
    
    if (!currentThreadId) {
      console.log('🆕 Yeni thread oluşturuluyor...');
      setIsCreatingNewThread(true);
    } else {
      console.log('📝 Mevcut thread\'e ekleniyor:', currentThreadId);
    }
    
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    const botMessageId = Date.now() + 1;
    const initialBotMessage = {
      id: botMessageId,
      type: "bot",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };
    
    setMessages((prev) => [...prev, initialBotMessage]);
    
    let finalAnswer = '';
    
    try {
      const streamResult = await chatAPI.streamingRequest(
        questionText,
        apiSettings.topK,
        user?.id,
        currentThreadId,
        (partialContent) => {
          finalAnswer = partialContent; 
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === botMessageId 
                ? { ...msg, content: partialContent, isStreaming: true }
                : msg
            )
          );
        },
        (threadId, conversationId) => {
          setCurrentThreadId(threadId);
          setCurrentConversationId(conversationId);
          setIsCreatingNewThread(false);
          console.log('Yeni thread kaydedildi:', { threadId, conversationId });
          
          if (!currentThreadId) {
            toast.success('Yeni sohbet başlatıldı! 💬', {
              position: "top-right",
              autoClose: 2000,
            });
          }
          
          window.dispatchEvent(new CustomEvent('threadSaved', { 
            detail: { 
              threadId,
              conversationId,
              question: questionText,
              answer: finalAnswer
            } 
          }));
        }
      );
      
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      
      toast.success('Model yanıtı tamamlandı! ✅', {
        position: "top-right",
        autoClose: 2000,
      });
      
      if (streamResult.conversationSaved) {
        if (streamResult.threadId && !currentThreadId) {
          setCurrentThreadId(streamResult.threadId);
          console.log('Thread ID güncellendi:', streamResult.threadId);
        }
        console.log('Thread başarıyla kaydedildi:', { 
          threadId: streamResult.threadId, 
          conversationId: streamResult.conversationId 
        });
      } else {
        console.warn('Thread kaydedilemedi');
      }
      
      setShowInputGlow(true);
      setTimeout(() => setShowInputGlow(false), 2000);
      
    } catch (error) {
      console.error("API Error:", error);
      
      try {
        const response = await chatAPI.normalRequest(questionText, apiSettings.topK, user?.id, currentThreadId);
        finalAnswer = response.answer;
        
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMessageId 
              ? { ...msg, content: response.answer, isStreaming: false }
              : msg
          )
        );
        
        if (response.conversationSaved) {
          if (response.threadId && !currentThreadId) {
            setCurrentThreadId(response.threadId);
            setCurrentConversationId(response.conversationId);
            console.log('Fallback Thread ID güncellendi:', response.threadId);
          }
          console.log('Fallback thread kaydedildi:', { 
            threadId: response.threadId, 
            conversationId: response.conversationId 
          });
          window.dispatchEvent(new CustomEvent('threadSaved', { 
            detail: { 
              threadId: response.threadId,
              conversationId: response.conversationId,
              question: questionText,
              answer: response.answer
            } 
          }));
        }
        
      } catch (fallbackError) {
        const errorMessage = `Üzgünüm, API bağlantısında bir hata oluştu: ${fallbackError.message}. Lütfen tekrar deneyin.`;
        
        toast.error('Bağlantı hatası! Lütfen tekrar deneyin. 🔄', {
          position: "top-right",
          autoClose: 4000,
        });
        
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMessageId 
              ? { ...msg, content: errorMessage, isStreaming: false }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      setIsCreatingNewThread(false); 
      setCurrentQuestion("");
    }
  };
  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content:"Hello, I'm your AI assistant. How can I assist you?",
        timestamp: new Date(),
      },
    ]);
    setCurrentConversationId(null);
    setCurrentThreadId(null); 
    setIsCreatingNewThread(false); 
    setCurrentQuestion(""); 
  };
  useEffect(() => {
    testConnection()
    checkRAGStatus();
    
 
    const handleClearChat = () => {
      setMessages([
        {
          id: 1,
          type: "bot",
          content: "Hello, I'm your AI assistant. How can I assist you?",
          timestamp: new Date(),
        },
      ]);
    };
    
    window.addEventListener('clearChat', handleClearChat);
    
    return () => {
      window.removeEventListener('clearChat', handleClearChat);
    };
  }, []);
  return {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isLoading,
    showInputGlow,
    connectionStatus,
    ragStatus,
    currentConversationId,
    currentThreadId,
    setCurrentThreadId,
    isCreatingNewThread,
    currentQuestion,
    sendMessage,
    clearChat,
    testConnection,
    checkRAGStatus
  };
};
