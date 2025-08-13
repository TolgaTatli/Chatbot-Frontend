import { Send } from "lucide-react";
import { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
const ChatInput = ({ 
  inputMessage, 
  setInputMessage, 
  isLoading, 
  showInputGlow, 
  onSendMessage 
}) => {
  const { isDarkMode } = useTheme();
  const inputRef = useRef(null);
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleInput = (e) => {
    setInputMessage(e.target.value);
    
    if (inputRef.current) {
      inputRef.current.style.height = '3rem'; 
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 128)}px`;
    }
  };
  return (
    <div className={`sticky bottom-0 z-20 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInput}
              onKeyDown={handleKeyPress}
              placeholder="Mesajınızı yazınız..."
              rows={1}
              style={{ 
                minHeight: '3rem',
                maxHeight: '8rem',
                overflow: 'hidden',
                lineHeight: '1.5'
              }}
              className={`w-full px-6 py-4 border-2 rounded-full resize-none focus:outline-none transition-all duration-500 text-base placeholder:text-base ${
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
              <div className={`absolute right-6 bottom-4 text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {inputMessage.length}/1000
              </div>
            )}
          </div>
          <button
            onClick={onSendMessage}
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
  );
};
export default ChatInput;
