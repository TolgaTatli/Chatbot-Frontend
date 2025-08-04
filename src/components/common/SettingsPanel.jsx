import { useTheme } from "../../context/ThemeContext";
const SettingsPanel = ({ showSettings, apiSettings, setApiSettings, ragStatus }) => {
  const { isDarkMode } = useTheme();
  if (!showSettings) return null;
  return (
    <div className={`sticky top-[72px] z-10 shadow-sm ${
      isDarkMode 
        ? 'bg-gray-800/95 backdrop-blur-lg border-b border-gray-700' 
        : 'bg-white/95 backdrop-blur-lg border-b border-gray-200'
    }`}>
      <div className="max-w-4xl mx-auto px-6 py-6">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              RAG Sistemi
            </h4>
            <div className="space-y-2">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Sistem: <span className={ragStatus.system === 'ready' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>{ragStatus.system}</span>
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Ollama: <span className={ragStatus.ollama === 'online' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>{ragStatus.ollama}</span>
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Model: <span className={ragStatus.model ? 'text-blue-500 font-medium' : 'text-red-500 font-medium'}>{ragStatus.model || 'yok'}</span>
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Dokümanlar: <span className="font-medium text-blue-500">{ragStatus.documents}</span>
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Info
            </h4>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
              <p>DECE AI Asistanı aktif olarak çalışıyor.</p>
              <p>Doküman tabanlı yanıtlar için RAG sistemi kullanılıyor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPanel;
