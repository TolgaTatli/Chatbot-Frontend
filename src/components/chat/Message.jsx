import { User, Bot, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { formatTime, copyToClipboard } from "../../utils/helpers";
import ReactMarkdown from 'react-markdown';
import Lottie from 'lottie-react';
import monkeyAnimation from '../../assets/monkey.json';

const Message = ({ message }) => {
  const { isDarkMode } = useTheme();
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div
      className={`flex ${
        message.type === "user" ? "justify-end" : "justify-start"
      } group`}
    >
      <div
        className={`flex items-start space-x-4 max-w-3xl ${
          message.type === "user"
            ? "flex-row-reverse space-x-reverse"
            : ""
        }`}
      >
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            message.type === "user"
              ? isDarkMode ? "bg-blue-600" : "bg-purple-600"
              : isDarkMode ? "bg-gray-600" : "bg-gray-700"
          }`}
        >
          {message.type === "user" ? (
            <User className="w-6 h-6 text-white" />
          ) : (
            <Bot className="w-6 h-6 text-white" />
          )}
        </div>

        <div
          className={`relative ${
            message.type === "user" ? "text-right" : "text-left"
          }`}
        >
          <div
            className={`inline-block px-6 py-4 rounded-2xl shadow-sm ${
              message.type === "user"
                ? isDarkMode 
                  ? "bg-blue-600 text-white"
                  : "bg-purple-600 text-white"
                : isDarkMode
                  ? "bg-gray-700 text-gray-100 border border-gray-600"
                  : "bg-white text-gray-900 border border-gray-200"
            }`}
          >
            {message.type === "bot" ? (
              <div className="text-sm leading-relaxed">
                <ReactMarkdown 
                  components={{
                    h1: ({children}) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                    h4: ({children}) => <h4 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h4>,
                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                    li: ({children}) => <li className="mb-1">{children}</li>,
                    code: ({children}) => <code className={`px-1 py-0.5 rounded text-xs font-mono ${isDarkMode ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-purple-600'}`}>{children}</code>,
                    pre: ({children}) => <pre className={`p-3 rounded-lg overflow-x-auto text-xs font-mono mb-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>{children}</pre>,
                    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                    em: ({children}) => <em className="italic">{children}</em>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {message.isStreaming && !message.content && (
                  <div className="mt-3">
                    <div className="flex items-center justify-center -m-8">
                      <Lottie 
                        animationData={monkeyAnimation}
                        className="w-13 h-10"
                        loop={true}
                        autoplay={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            )}
          </div>

          <div
            className={`flex items-center mt-2 space-x-2 text-xs ${
              message.type === "user" ? "justify-end" : "justify-start"
            } ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <span>{formatTime(message.timestamp)}</span>
            <button
              onClick={handleCopy}
              className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 ${
                isDarkMode 
                  ? 'hover:bg-gray-600' 
                  : 'hover:bg-gray-100'
              }`}
              title="Kopyala"
            >
              {copiedId === message.id ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
