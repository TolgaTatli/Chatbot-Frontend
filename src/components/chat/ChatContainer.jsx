import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
const ChatContainer = ({ 
  messages, 
  inputMessage, 
  setInputMessage, 
  isLoading, 
  showInputGlow, 
  onSendMessage 
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <MessageList messages={messages} />
      <ChatInput 
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        isLoading={isLoading}
        showInputGlow={showInputGlow}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};
export default ChatContainer;
