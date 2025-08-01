import { Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
const StatusBadge = ({ connectionStatus, ragStatus }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`fixed bottom-6 right-6 flex items-center space-x-2 text-white px-4 py-2 rounded-full shadow-lg ${
      isDarkMode ? 'bg-blue-600' : 'bg-purple-600'
    }`}>
      <Sparkles className="w-4 h-4 animate-pulse" />
      <span className="text-sm font-medium">
        {connectionStatus === "connected"
          ? `RAG AI Aktif (${ragStatus.documents} doküman)`
          : connectionStatus === "testing"
          ? "Test Ediliyor"
          : "Bağlantı Hatası"}
      </span>
    </div>
  );
};
export default StatusBadge;
