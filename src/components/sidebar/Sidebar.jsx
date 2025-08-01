import { Bot, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import NewChatButton from "./NewChatButton";
import ConversationList from "./ConversationList";
import UserSection from "./UserSection";

const Sidebar = ({ 
  showSidebar, 
  setShowSidebar, 
  conversations, 
  currentConversationId,
  onCreateNew,
  onLoadConversation,
  onDeleteConversation,
  user
}) => {
  const { isDarkMode } = useTheme();

  return (
    <>
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

          <NewChatButton onCreateNew={onCreateNew} />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Geçmiş Sohbetler
          </div>
          
          <ConversationList 
            conversations={conversations}
            currentConversationId={currentConversationId}
            onLoadConversation={onLoadConversation}
            onDeleteConversation={onDeleteConversation}
            user={user}
          />
        </div>

        {/* User Section */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <UserSection />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
