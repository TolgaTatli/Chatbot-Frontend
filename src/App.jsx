import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageCircle,
  Settings,
  Trash2,
  Copy,
  Check,
  Moon,
  Sun,
} from "lucide-react";
import "./App.css";
import deceLogo from "./assets/deceLogo.png";
import ReactMarkdown from 'react-markdown';

function App() {
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
  const [copiedId, setCopiedId] = useState(null);
  const [apiSettings, setApiSettings] = useState({
    temperature: 0.7,
    maxLength: 1000,
    topP: 0.9,
    topK: 3, // RAG için doküman sayısı
  });
  const [showSettings, setShowSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connected"); // connected, disconnected, testing
  const [ragStatus, setRagStatus] = useState({
    system: 'unknown',
    ollama: 'unknown',
    documents: 0,
    model: 'unknown'
  }); // RAG sistem durumu
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Dark mode body class effect
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('dark-mode');
    };
  }, [isDarkMode]);

  const handleSendMessage = async () => {
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

    try {
      const response = await callChatAPI(inputMessage);

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: `Üzgünüm, API bağlantısında bir hata oluştu: ${error.message}. Lütfen tekrar deneyin.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const callChatAPI = async (message) => {
    const response = await fetch(
      "http://localhost:8000/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message, // RAG API formatı
          top_k: apiSettings.topK // Ayarlardan alınan doküman sayısı
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // RAG API'den gelen yanıt
    let responseText = data.answer || "Yanıt alınamadı";

    // Ollama hatası kontrolü
    if (responseText.includes("Ollama hatasÄ±: 500") || responseText.includes("Ollama hatası: 500")) {
      responseText = "🔧 Model yükleme hatası. RAG sistemi çalışıyor ancak AI modeli yüklenemiyor. Lütfen sistem yöneticisine başvurun veya birkaç dakika bekleyip tekrar deneyin.";
    }

    // Boş yanıt kontrolü
    if (!responseText || responseText.length < 10) {
      responseText = "Yanıt oluşturulamadı, lütfen soruyu yeniden deneyin.";
    }

    return responseText;
  };

  const testApiConnection = async () => {
    setConnectionStatus("testing");
    try {
      await callChatAPI("Test mesajı");
      setConnectionStatus("connected");
      return true;
    } catch (error) {
      setConnectionStatus("disconnected");
      console.error("API Test Failed:", error);
      return false;
    }
  };

  const checkRAGStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/status");
      const status = await response.json();
      setRagStatus({
        system: status.rag_system,
        ollama: status.ollama_status,
        documents: status.document_count,
        model: status.model
      });
    } catch (error) {
      console.error("RAG Status Error:", error);
      setRagStatus({
        system: 'error',
        ollama: 'error',
        documents: 0,
        model: 'unknown'
      });
    }
  };

  useEffect(() => {
    testApiConnection();
    checkRAGStatus(); // RAG durumunu da kontrol et
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content:
          "Merhaba! Ben AI asistanınızım. Size nasıl yardımcı olabilirim?",
        timestamp: new Date(),
      },
    ]);
  };

  const copyMessage = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Kopyalama başarısız:", err);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/95 backdrop-blur-lg border-b border-gray-700' 
          : 'bg-white/95 backdrop-blur-lg border-b border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-2 py-6">
          <div className="flex items-center justify-between -px-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300 ${
                  isDarkMode ? 'bg-blue-600' : 'bg-purple-600'
                }`}>
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                
                <div className="flex items-center space-x-3">
                  <img src={deceLogo} alt="DECE Logo" className="w-21 h-4.5 object-contain" />
                </div>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {connectionStatus === "connected" &&
                    "DECE Asistanınız Aktif"}
                  {connectionStatus === "testing" &&
                    "Bağlantı test ediliyor..."}
                  {connectionStatus === "disconnected" &&
                    "API Bağlantısı Kesildi"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-400 animate-pulse"
                    : connectionStatus === "testing"
                    ? "bg-yellow-400 animate-pulse"
                    : "bg-red-400"
                }`}
              ></div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title={isDarkMode ? "Açık Tema" : "Koyu Tema"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={clearChat}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                }`}
                title="Sohbeti temizle"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="API Ayarları"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={testApiConnection}
                disabled={connectionStatus === "testing"}
                className={`px-3 py-1 text-xs rounded-full transition-all duration-200 disabled:opacity-50 ${
                  isDarkMode 
                    ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
                title="API Bağlantısını Test Et"
              >
                Test API
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showSettings && (
        <div className={`fixed top-[88px] left-0 right-0 z-15 shadow-sm fixed-settings-panel settings-transition ${
          isDarkMode 
            ? 'bg-gray-800/95 backdrop-blur-lg border-b border-gray-700' 
            : 'bg-white/95 backdrop-blur-lg border-b border-gray-200'
        }`}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              API Ayarları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Top K (Doküman Sayısı)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={apiSettings.topK}
                  onChange={(e) =>
                    setApiSettings((prev) => ({
                      ...prev,
                      topK: parseInt(e.target.value),
                    }))
                  }
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                  }`}
                />
                <div className={`flex justify-between text-xs mt-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span>Az (1)</span>
                  <span className="font-medium">{apiSettings.topK}</span>
                  <span>Çok (10)</span>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  RAG Durumu
                </label>
                <div className={`p-3 rounded-lg transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="space-y-1">
                    <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Sistem: <span className={ragStatus.system === 'ready' ? 'text-green-500' : 'text-red-500'}>{ragStatus.system}</span>
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Ollama: <span className={ragStatus.ollama === 'online' ? 'text-green-500' : 'text-red-500'}>{ragStatus.ollama}</span>
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Model: <span className={ragStatus.model ? 'text-blue-500' : 'text-red-500'}>{ragStatus.model || 'yok'}</span>
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Dokümanlar: {ragStatus.documents}
                    </div>
                  </div>
                  {ragStatus.ollama === 'online' && ragStatus.system === 'ready' && (
                    <div className={`mt-2 text-xs ${isDarkMode ? 'text-yellow-300' : 'text-orange-600'}`}>
                      ⚠️ Model hatası varsa birkaç dakika bekleyin
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-purple-900/30' : 'bg-blue-50'
            }`}>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-purple-200' : 'text-blue-800'
              }`}>
                <strong>API Endpoint:</strong>{" "}
                http://localhost:8000/generate
              </p>
              <p className={`text-xs mt-1 transition-colors duration-300 ${
                isDarkMode ? 'text-purple-300' : 'text-blue-600'
              }`}>
                <span className={`font-semibold font-mono ${
                  isDarkMode ? 'text-purple-100' : 'text-slate-800'
                }`}>
                  LLaMA 3.2{" "}
                </span>
                modeli üzerinde RAG sistemi çalışıyor. Model yükleme hatası varsa sistem yöneticisine başvurun.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div 
        className={`max-w-5xl mx-auto px-6 py-4 flex flex-col transition-all duration-300 ${
          showSettings 
            ? 'h-[calc(100vh-280px)] mt-[200px] chat-with-settings-mobile' 
            : 'h-[calc(100vh-120px)] mt-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-modern pr-4 chat-content-spacer pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              } group`}
            >
              <div
                className={`flex items-start space-x-4 max-w-4xl ${
                  message.type === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${
                    message.type === "user"
                      ? isDarkMode ? "bg-blue-600" : "bg-purple-600"
                      : isDarkMode ? "bg-gray-600" : "bg-gray-700"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-6 h-6 text-white" />
                  ) : (
                    <Bot className="w-6 h-6 text-white" />
                  )}
                </div>

                <div
                  className={`relative ${
                    message.type === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block px-6 py-4 rounded-2xl transition-all duration-200 shadow-sm ${
                      message.type === "user"
                        ? isDarkMode 
                          ? "bg-blue-600 text-white"
                          : "bg-purple-600 text-white"
                        : isDarkMode
                          ? "bg-gray-700 text-gray-100 border border-gray-600"
                          : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    {message.type === "bot" ? (
                      <div className="text-sm leading-relaxed">
                        <ReactMarkdown 
                          components={{
                            h1: ({children}) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                            h2: ({children}) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                            h4: ({children}) => <h4 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h4>,
                            p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                            li: ({children}) => <li className="mb-1">{children}</li>,
                            code: ({children}) => <code className={`px-1 py-0.5 rounded text-xs font-mono ${isDarkMode ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-purple-600'}`}>{children}</code>,
                            pre: ({children}) => <pre className={`p-3 rounded-lg overflow-x-auto text-xs font-mono mb-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>{children}</pre>,
                            strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                            em: ({children}) => <em className="italic">{children}</em>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>

                  <div
                    className={`flex items-center mt-2 space-x-2 text-xs transition-colors duration-300 ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    } ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    <span>{formatTime(message.timestamp)}</span>
                    <button
                      onClick={() => copyMessage(message.content, message.id)}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 ${
                        isDarkMode 
                          ? 'hover:bg-gray-600' 
                          : 'hover:bg-gray-100'
                      }`}
                      title="Kopyala"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-4 max-w-4xl">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-700'
                }`}>
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className={`rounded-2xl px-6 py-4 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border border-gray-600' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                    }`}></div>
                    <div
                      className={`w-2 h-2 rounded-full animate-bounce ${
                        isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                      }`}
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className={`w-2 h-2 rounded-full animate-bounce ${
                        isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                      }`}
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Area - Gemini Style */}
      <div className={`fixed bottom-0 left-0 right-0 z-20 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-900' 
          : 'bg-gray-50'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder="Mesajınızı yazınız..."
                rows={1}
                className={`w-full max-h-32 min-h-[3rem] px-6 py-4 border-2 rounded-full resize-none focus:outline-none transition-all duration-200 text-base placeholder:text-base ${
                  isDarkMode
                    ? 'bg-gray-800 text-gray-100 placeholder-gray-400 border-gray-700 focus:border-blue-500 hover:border-gray-600'
                    : 'bg-white text-gray-900 placeholder-gray-500 border-gray-200 focus:border-gray-400 hover:border-gray-300 shadow-sm'
                }`}
                disabled={isLoading}
              />
              {inputMessage && (
                <div className={`absolute right-6 bottom-4 text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {inputMessage.length}/1000
                </div>
              )}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`flex-shrink-0 w-12 h-12 text-white rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 group ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700' 
                  : 'bg-black hover:bg-gray-800 disabled:bg-gray-300'
              }`}
            >
              <Send className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>

      <div className={`fixed bottom-6 right-6 flex items-center space-x-2 text-white px-4 py-2 rounded-full shadow-lg transition-colors duration-300 ${
        isDarkMode ? 'bg-blue-600' : 'bg-purple-600'
      }`}>
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-medium">
          {connectionStatus === "connected"
            ? `RAG AI Aktif (${ragStatus.documents} doküman)`
            : connectionStatus === "testing"
            ? "Test Ediliyor"
            : "Bağlantı Hatası"}
        </span>
      </div>
    </div>
  );
}

export default App;
