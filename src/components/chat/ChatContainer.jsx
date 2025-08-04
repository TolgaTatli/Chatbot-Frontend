import { useState, useEffect } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const ChatContainer = ({ 
  messages, 
  inputMessage, 
  setInputMessage, 
  isLoading, 
  showInputGlow, 
  onSendMessage,
  currentConversationId
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousConversationId, setPreviousConversationId] = useState(currentConversationId);

  useEffect(() => {
    if (currentConversationId !== previousConversationId) {
      setIsTransitioning(true);
      
      // Animation süresi sonunda transition'ı bitir
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPreviousConversationId(currentConversationId);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [currentConversationId, previousConversationId]);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Wave Loading Animation */}
      {isTransitioning && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 animate-wave-transition">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-wave-dot animation-delay-0"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-wave-dot animation-delay-100"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-wave-dot animation-delay-200"></div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-500 ${
        isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
      }`}>
        <MessageList messages={messages} isTransitioning={isTransitioning} />
        <ChatInput 
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          isLoading={isLoading}
          showInputGlow={showInputGlow}
          onSendMessage={onSendMessage}
        />
      </div>
    </div>
  );
};
export default ChatContainer;
