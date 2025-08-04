import { Trash2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
const ConversationList = ({ 
  conversations, 
  currentConversationId, 
  onLoadConversation, 
  onDeleteConversation,
  user 
}) => {
  const { isDarkMode } = useTheme();
  const handleDelete = (conversationId, e) => {
    e.stopPropagation();
    onDeleteConversation(conversationId);
  };
  if (conversations.length === 0) {
    return (
      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {user ? 'Henüz sohbet geçmişiniz yok' : 'Sohbet geçmişi için giriş yapın'}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {conversations.map((conv, index) => (
        <div
          key={conv.id}
          className={`relative group rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 animate-fade-in-up ${
            currentConversationId === conv.id
              ? isDarkMode ? 'bg-gray-700 shadow-lg' : 'bg-purple-50 shadow-lg'
              : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <button
            onClick={() => onLoadConversation(conv.id)}
            className="w-full text-left p-3 pr-12 rounded-lg transition-all duration-200 hover:bg-opacity-80"
          >
            <div className={`text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {conv.question.slice(0, 50)}...
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(conv.created_at).toLocaleDateString('tr-TR')}
            </div>
          </button>
          
          {/* Delete Button */}
          <button
            onClick={(e) => handleDelete(conv.id, e)}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
            title="Sohbeti Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
export default ConversationList;
