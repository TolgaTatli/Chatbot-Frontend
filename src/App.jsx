import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { useChat } from "./hooks/useChat";
import { useConversations } from "./hooks/useConversations";
import { DEFAULT_API_SETTINGS } from "./utils/constants";
import Header from "./components/common/Header";
import SettingsPanel from "./components/common/SettingsPanel";
import Sidebar from "./components/sidebar/Sidebar";
import ChatContainer from "./components/chat/ChatContainer";
import AuthModal from "./components/auth/AuthModal";
import "./App.css";

const AppContent = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  // Sidebar başlangıçta masaüstünde açık, mobilde kapalı
  const [showSidebar, setShowSidebar] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      const checkScreenSize = () => {
        setShowSidebar(window.innerWidth >= 1024); // lg breakpoint
        setIsInitialized(true);
      };
      
      checkScreenSize();
    }
  }, [isInitialized]);
  
  const [showSettings, setShowSettings] = useState(false);
  const [apiSettings, setApiSettings] = useState(DEFAULT_API_SETTINGS);
  const {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isLoading,
    showInputGlow,
    connectionStatus,
    ragStatus,
    currentConversationId: chatConversationId,
    sendMessage,
    clearChat
  } = useChat(user, apiSettings);
  const {
    conversations,
    currentConversationId,
    loadConversations,
    loadConversationById,
    deleteConversation,
    createNewConversation
  } = useConversations(user);
  const handleCreateNewConversation = () => {
    createNewConversation(setMessages);
  };
  const handleLoadConversation = (conversationId) => {
    loadConversationById(conversationId, setMessages);
  };
  const handleDeleteConversation = (conversationId) => {
    deleteConversation(conversationId, handleCreateNewConversation);
  };
  return (
    <div className={`min-h-screen flex transition-all duration-300 ease-in-out ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Mobile Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
      
      {/* Sidebar - ChatGPT tarzı */}
      {showSidebar && (
        <div className="w-80 flex-shrink-0 fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto">
          <Sidebar 
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            conversations={conversations}
            currentConversationId={currentConversationId}
            onCreateNew={handleCreateNewConversation}
            onLoadConversation={handleLoadConversation}
            onDeleteConversation={handleDeleteConversation}
            user={user}
          />
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 h-screen max-h-screen flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        <Header 
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          connectionStatus={connectionStatus}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          clearChat={clearChat}
        />
        
        <SettingsPanel 
          showSettings={showSettings}
          apiSettings={apiSettings}
          setApiSettings={setApiSettings}
          ragStatus={ragStatus}
        />
        <ChatContainer 
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          isLoading={isLoading}
          showInputGlow={showInputGlow}
          onSendMessage={sendMessage}
          currentConversationId={currentConversationId}
        />
      </div>
      <AuthModal onLoadConversations={loadConversations} />
    </div>
  );
};
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
