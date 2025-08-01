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
    <div className={`h-screen w-80 transform transition-all duration-300 ease-in-out ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        
        {/* Sidebar Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${
          showSidebar ? 'animate-fade-in-up' : ''
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bot className={`w-6 h-6 transition-colors duration-200 ${isDarkMode ? 'text-blue-400' : 'text-purple-600'}`} />
              <span className={`font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                DECE AI
              </span>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className={`lg:hidden p-1 rounded transition-all duration-200 hover:scale-110 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
          <NewChatButton onCreateNew={onCreateNew} />
        </div>
        {/* Conversations List */}
        <div className={`flex-1 overflow-y-auto p-4 sidebar-scroll ${
          showSidebar ? 'animate-fade-in-up animation-delay-100' : ''
        }`}>
          <div className={`text-xs font-medium mb-3 transition-colors duration-200 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
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
        <div className={`p-4 border-t transition-colors duration-200 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } ${showSidebar ? 'animate-fade-in-up animation-delay-200' : ''}`}>
          <UserSection />
        </div>
      </div>
  );
};
export default Sidebar;
