import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { useChat } from "./hooks/useChat";
import { useConversations } from "./hooks/useConversations";
import { DEFAULT_API_SETTINGS } from "./utils/constants";

// Components
import Header from "./components/common/Header";
import StatusBadge from "./components/common/StatusBadge";
import SettingsPanel from "./components/common/SettingsPanel";
import Sidebar from "./components/sidebar/Sidebar";
import ChatContainer from "./components/chat/ChatContainer";
import AuthModal from "./components/auth/AuthModal";

import "./App.css";

const AppContent = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  // States
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiSettings, setApiSettings] = useState(DEFAULT_API_SETTINGS);

  // Custom hooks
  const {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isLoading,
    showInputGlow,
    connectionStatus,
    ragStatus,
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

  // Handlers
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
    <div className={`min-h-screen flex transition-all duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
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

      <div className="flex-1 flex flex-col">
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
        />
      </div>

      <AuthModal onLoadConversations={loadConversations} />
      <StatusBadge connectionStatus={connectionStatus} ragStatus={ragStatus} />
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
