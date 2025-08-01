import { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { CONNECTION_STATUS } from '../utils/constants';

export const useChat = (user, apiSettings) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Merhaba! Ben AI asistanınızım. Size nasıl yardımcı olabilirim?",
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

  // Test API connection
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

  // Check RAG status
  const checkRAGStatus = async () => {
    const status = await chatAPI.getRAGStatus();
    setRagStatus(status);
  };

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

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

    try {
      // Try streaming API first
      await chatAPI.streamingRequest(
        inputMessage,
        apiSettings.topK,
        user?.id,
        (partialContent) => {
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === botMessageId 
                ? { ...msg, content: partialContent, isStreaming: true }
                : msg
            )
          );
        }
      );

      // Complete streaming
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

      // Show input glow effect
      setShowInputGlow(true);
      setTimeout(() => setShowInputGlow(false), 2000);

    } catch (error) {
      console.error("API Error:", error);
      
      // Try fallback API
      try {
        const response = await chatAPI.normalRequest(inputMessage, apiSettings.topK, user?.id);
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMessageId 
              ? { ...msg, content: response, isStreaming: false }
              : msg
          )
        );
      } catch (fallbackError) {
        const errorMessage = `Üzgünüm, API bağlantısında bir hata oluştu: ${fallbackError.message}. Lütfen tekrar deneyin.`;
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
    }
  };

  // Clear chat
  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "Merhaba! Ben AI asistanınızım. Size nasıl yardımcı olabilirim?",
        timestamp: new Date(),
      },
    ]);
  };

  // Initialize
  useEffect(() => {
    testConnection();
    checkRAGStatus();
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
    sendMessage,
    clearChat,
    testConnection,
    checkRAGStatus
  };
};
