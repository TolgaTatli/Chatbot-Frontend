import { useRef, useEffect } from "react";
import Message from "./Message";

const MessageList = ({ messages, isTransitioning = false }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Ana scroll fonksiyonu - her zaman çalışır
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100); // Kısa bir gecikme ile scroll yap
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Transition durumunda da scroll yap
  useEffect(() => {
    if (!isTransitioning) {
      scrollToBottom();
    }
  }, [isTransitioning]);

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div 
              key={message.id}
              className={`animate-slide-in-up animation-delay-${Math.min(index * 50, 500)}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Message message={message} />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};
export default MessageList;
