import { Trash2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
const ConversationList = ({ 
  threads, 
  currentThreadId, 
  onLoadThread, 
  onDeleteThread,
  user,
  isLoadingNewThread = false,
  loadingQuestion = ""
}) => {
  const { isDarkMode } = useTheme();
  
  const handleDelete = (threadId, e) => {
    e.stopPropagation();
    onDeleteThread(threadId);
  };
  
  if (threads.length === 0 && !isLoadingNewThread) {
    return (
      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {user ? 'Henüz sohbet geçmişiniz yok' : 'Sohbet geçmişi için giriş yapın'}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {/* Loading State - Yeni sohbet oluşturulurken */}
      {isLoadingNewThread && (
        <div className={`relative rounded-lg border-2 border-dashed transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600 text-gray-300' 
            : 'bg-gray-50 border-gray-300 text-gray-600'
        }`}>
          <div className="p-3">
            <div className="flex items-center space-x-2">
              <div className="animate-spin">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              </div>
              <span className="text-sm font-medium">Yeni sohbet...</span>
            </div>
            <div className={`text-xs mt-1 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {loadingQuestion || "Mesajınız işleniyor..."}
            </div>
          </div>
        </div>
      )}
      
      {threads.map((thread, index) => (
        <div
          key={thread.thread_id}
          className={`relative group rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 animate-fade-in-up ${
            currentThreadId === thread.thread_id
              ? isDarkMode ? 'bg-gray-700 shadow-lg' : 'bg-purple-50 shadow-lg'
              : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <button
            onClick={() => onLoadThread(thread.thread_id)}
            className="w-full text-left p-3 pr-12 rounded-lg transition-all duration-200 hover:bg-opacity-80"
          >
            <div className={`text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {(thread.thread_title || thread.title || thread.first_message || 'Yeni Sohbet').slice(0, 50)}...
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {(thread.thread_created_at || thread.created_at) ? 
                new Date(thread.thread_created_at || thread.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 
                'Bugün'
              }
              {thread.message_count && (
                <span className="ml-2">• {thread.message_count} mesaj</span>
              )}
            </div>
          </button>
          
          {/* Delete Button */}
          <button
            onClick={(e) => handleDelete(thread.thread_id, e)}
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
