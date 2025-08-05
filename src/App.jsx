import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { useChat } from "./hooks/useChat";
import { useThreads } from "./hooks/useThreads";
import { DEFAULT_API_SETTINGS } from "./utils/constants";
import Header from "./components/common/Header";
import SettingsPanel from "./components/common/SettingsPanel";
import Sidebar from "./components/sidebar/Sidebar";
import ChatContainer from "./components/chat/ChatContainer";
import AuthModal from "./components/auth/AuthModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    currentThreadId,
    setCurrentThreadId,
    isCreatingNewThread,
    currentQuestion,
    sendMessage,
    clearChat,
  } = useChat(user, apiSettings);

  const {
    threads,
    currentThreadId: threadsCurrentThreadId,
    loadThreads,
    loadThreadMessages,
    deleteThread,
    createNewConversation,
  } = useThreads(user);
  const handleCreateNewConversation = () => {
    createNewConversation(setMessages, setCurrentThreadId);
  };

  const handleLoadThread = (threadId) => {
    console.log("🔄 Thread yükleniyor - App.jsx:", threadId, typeof threadId);
    console.log("🔄 Mevcut currentThreadId:", currentThreadId);
    loadThreadMessages(threadId, setMessages, setCurrentThreadId);
  };

  const handleDeleteThread = (threadId) => {
    deleteThread(threadId, handleCreateNewConversation);
  };
  return (
    <div
      className={`min-h-screen flex transition-all duration-300 ease-in-out ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
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
            threads={threads}
            currentThreadId={currentThreadId || threadsCurrentThreadId}
            onCreateNew={handleCreateNewConversation}
            onLoadThread={handleLoadThread}
            onDeleteThread={handleDeleteThread}
            user={user}
            isLoadingNewThread={isCreatingNewThread}
            loadingQuestion={currentQuestion}
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
          currentConversationId={currentThreadId || threadsCurrentThreadId}
        />
      </div>
      <AuthModal onLoadConversations={loadThreads} />

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
        toastClassName="!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-white"
        bodyClassName="!text-gray-900 dark:!text-white"
        progressClassName="!bg-blue-500"
      />
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
