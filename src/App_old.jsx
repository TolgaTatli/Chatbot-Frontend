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
  Plus,
  LogIn,
  LogOut,
  Menu,
  X,
  History,
  Search,
  Edit3,
} from "lucide-react";
import "./App.css";
import deceLogo from "./assets/deceLogo.png";
import ReactMarkdown from 'react-markdown';
import Lottie from 'lottie-react';
import monkeyAnimation from './assets/Tenor-Monkey.json';

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
  const [showInputGlow, setShowInputGlow] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '' });
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
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

    // Bot mesajı için placeholder oluştur
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
      // Streaming API'yi çağır - dönen değeri kullanmıyoruz çünkü onChunk callback ile güncelliyoruz
      await callChatAPI(inputMessage, (partialContent) => {
        // Streaming sırasında mesajı güncelle
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMessageId 
              ? { ...msg, content: partialContent, isStreaming: true }
              : msg
          )
        );
      });

      // Streaming tamamlandığında sadece isStreaming'i false yap
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

      // Input glow efektini başlat
      setShowInputGlow(true);
      setTimeout(() => setShowInputGlow(false), 2000);

    } catch (error) {
      console.error("API Error:", error);
      const errorMessage = `Üzgünüm, API bağlantısında bir hata oluştu: ${error.message}. Lütfen tekrar deneyin.`;
      
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { ...msg, content: errorMessage, isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const callChatAPI = async (message, onChunk) => {
    // Önce streaming endpoint'ini dene
    try {
      return await streamingAPI(message, onChunk);
    } catch (streamError) {
      console.warn("Streaming API başarısız, fallback API'ye geçiliyor:", streamError);
      // Fallback olarak normal API'yi kullan
      return await normalAPI(message);
    }
  };

  const streamingAPI = async (message, onChunk) => {
    return new Promise((resolve, reject) => {
      // POST request için form data hazırla
      const requestBody = JSON.stringify({
        question: message,
        top_k: apiSettings.topK
      });

      // EventSource POST request için workaround
      fetch("http://localhost:8000/generate-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
              // Stream tamamlandı - sadece resolve et, ekstra yanıt ekleme
              resolve();
              return;
            }

            // Gelen veriyi buffer'a ekle
            buffer += decoder.decode(value, { stream: true });
            
            // Satır satır işle
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Son eksik satırı buffer'da tut

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6)); // 'data: ' kısmını çıkar
                  
                  if (data.type === 'start') {
                    console.log('Streaming yanıt başladı...');
                  } 
                  else if (data.type === 'chunk') {
                    fullAnswer += data.text;
                    if (onChunk) {
                      onChunk(fullAnswer);
                    }
                  } 
                  else if (data.type === 'end') {
                    // Kaynaklar ve güven skoru kaldırıldı - sadece ana yanıtı kullan
                    // Ekstra bilgi eklenmeyecek
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

            // Bir sonraki chunk'ı oku
            processStream();
          }).catch(reject);
        };

        processStream();
      })
      .catch(reject);
    });
  };

  const normalAPI = async (message) => {
    const response = await fetch(
      "http://localhost:8000/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message,
          top_k: apiSettings.topK
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let responseText = data.answer || "Yanıt alınamadı";

    // Ollama hatası kontrolü
    if (responseText.includes("Ollama hatasÄ±: 500") || responseText.includes("Ollama hatası: 500")) {
      responseText = "🔧 Model yükleme hatası. RAG sistemi çalışıyor ancak AI modeli yüklenemiyor. Lütfen sistem yöneticisine başvurun veya birkaç dakika bekleyip tekrar deneyin.";
    }

    if (!responseText || responseText.length < 10) {
      responseText = "Yanıt oluşturulamadı, lütfen soruyu yeniden deneyin.";
    }

    return responseText;
  };

  const testApiConnection = async () => {
    setConnectionStatus("testing");
    try {
      // Streaming test için kısa bir mesaj gönder
      await callChatAPI("Test mesajı", null);
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

  // ====== AUTH FUNCTIONS ======
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'signin' ? '/auth/signin' : '/auth/signup';
    
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
          ...(authMode === 'signup' && { full_name: authForm.fullName })
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        if (authMode === 'signin') {
          setUser(data.user);
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setShowAuthModal(false);
          loadConversations();
        } else {
          // Signup başarılı, signin'e geç
          setAuthMode('signin');
          setAuthForm({ email: authForm.email, password: '', fullName: '' });
        }
      } else {
        alert(data.detail || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Bağlantı hatası');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setConversations([]);
      setCurrentConversationId(null);
    }
  };

  const loadConversations = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Load conversations error:', error);
    }
  };

  const createNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "Merhaba! Ben AI asistanınızım. Size nasıl yardımcı olabilirim?",
        timestamp: new Date(),
      },
    ]);
  };

  // Check for existing auth on load
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      loadConversations();
    }
  }, []);

  return (
    <div className={`min-h-screen flex transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-gray-50'
    }`}>
      
      {/* Sidebar Overlay (Mobile) */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ${
        showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        
        {/* Sidebar Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bot className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-purple-600'}`} />
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                DECE AI
              </span>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className={`lg:hidden p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={createNewConversation}
            className={`w-full flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'border-gray-600 hover:bg-gray-700 text-white' 
                : 'border-gray-300 hover:bg-gray-50 text-gray-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Sohbet</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Geçmiş Sohbetler
          </div>
          
          {conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setCurrentConversationId(conv.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors group ${
                    currentConversationId === conv.id
                      ? isDarkMode ? 'bg-gray-700' : 'bg-purple-50'
                      : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {conv.question.slice(0, 50)}...
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(conv.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Henüz sohbet geçmişiniz yok
            </div>
          )}
        </div>

        {/* User Section */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {user ? (
            <div className="space-y-3">
              <div className={`flex items-center space-x-3 p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-purple-600'}`}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-red-400 hover:bg-red-900/20' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className={`w-full flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border-purple-600 bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Giriş Yap</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`sticky top-0 z-10 transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/95 backdrop-blur-lg border-b border-gray-700' 
            : 'bg-white/95 backdrop-blur-lg border-b border-gray-200'
        }`}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className={`lg:hidden p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Menu className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
                
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
                http://localhost:8000/generate-stream (Streaming)
              </p>
              <p className={`text-xs mt-1 transition-colors duration-300 ${
                isDarkMode ? 'text-purple-300' : 'text-blue-600'
              }`}>
                <span className={`font-semibold font-mono ${
                  isDarkMode ? 'text-purple-100' : 'text-slate-800'
                }`}>
                  LLaMA 3.2 / Gemma3{" "}
                </span>
                modeli üzerinde RAG sistemi çalışıyor. Yanıtlar gerçek zamanlı streaming ile alınıyor. Streaming çalışmazsa otomatik fallback.
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
                        {message.isStreaming && !message.content && (
                          <div className="mt-3">
                            <div className="flex items-center justify-center -m-8">
                              <Lottie 
                                animationData={monkeyAnimation}
                                className="w-13 h-10"
                                loop={true}
                                autoplay={true}
                              />
                            </div>
                          </div>
                        )}
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
                className={`w-full max-h-32 min-h-[3rem] px-6 py-4 border-2 rounded-full resize-none focus:outline-none transition-all duration-500 text-base placeholder:text-base relative ${
                  showInputGlow 
                    ? isDarkMode
                      ? 'bg-gray-800 text-gray-100 placeholder-gray-400 border-2 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse'
                      : 'bg-white text-gray-900 placeholder-gray-500 border-2 border-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.4)] animate-pulse'
                    : isDarkMode
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
            ? `RAG AI Streaming Aktif (${ragStatus.documents} doküman)`
            : connectionStatus === "testing"
            ? "Test Ediliyor"
            : "Bağlantı Hatası"}
        </span>
      </div>
    </div>
  );
}

export default App;
