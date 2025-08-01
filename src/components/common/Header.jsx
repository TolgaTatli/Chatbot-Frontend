import { Menu, Bot, Sun, Moon, Trash2, Settings } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import deceLogo from "../../assets/deceLogo.png";
const Header = ({ 
  showSidebar, 
  setShowSidebar, 
  connectionStatus, 
  showSettings, 
  setShowSettings, 
  clearChat 
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <div className={`sticky top-0 z-10 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-800/95 backdrop-blur-lg border-b border-gray-700' 
        : 'bg-white/95 backdrop-blur-lg border-b border-gray-200'
    }`}>
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title="Sidebar'ı Aç/Kapat"
            >
              <Menu className={`w-5 h-5 transition-all duration-300 ease-in-out ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              } ${showSidebar ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`} />
            </button>
            
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300 ${
                isDarkMode ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-3">
                <img src={deceLogo} alt="DECE Logo" className="w-21 h-4.5 object-contain" />
              </div>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {connectionStatus === "connected" && "DECE Asistanınız Aktif"}
                {connectionStatus === "testing" && "Bağlantı test ediliyor..."}
                {connectionStatus === "disconnected" && "API Bağlantısı Kesildi"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-400 animate-pulse"
                  : connectionStatus === "testing"
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-red-400"
              }`}
            ></div>
            
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95 ${
                isDarkMode 
                  ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 hover:shadow-lg' 
                  : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50 hover:shadow-lg'
              }`}
              title={isDarkMode ? "Açık Temaya Geç (Kayıtlı kalır)" : "Koyu Temaya Geç (Kayıtlı kalır)"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-180" />
              ) : (
                <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-12" />
              )}
            </button>
            
            <button
              onClick={clearChat}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }`}
              title="Sohbeti temizle"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="API Ayarları"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
