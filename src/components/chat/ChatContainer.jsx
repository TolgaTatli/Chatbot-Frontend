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
  const [animationPhase, setAnimationPhase] = useState('idle');

  useEffect(() => {
    if (currentConversationId !== previousConversationId) {
      setAnimationPhase('blur-out');
      setIsTransitioning(true);
      
      const changeContentTimer = setTimeout(() => {
        setAnimationPhase('blur-in');
        setPreviousConversationId(currentConversationId);
      }, 400);
      
      const endTransitionTimer = setTimeout(() => {
        setIsTransitioning(false);
        setAnimationPhase('idle');
      }, 800);

      return () => {
        clearTimeout(changeContentTimer);
        clearTimeout(endTransitionTimer);
      };
    }
  }, [currentConversationId, previousConversationId]);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-400 ${
        animationPhase === 'blur-out' ? 'animate-blur-out' :
        animationPhase === 'blur-in' ? 'animate-blur-in' :
        'opacity-100'
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
