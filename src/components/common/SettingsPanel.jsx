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
      <div className="max-w-4xl mx-auto px-4 py-4">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          API Ayarları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Top K (Doküman Sayısı)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={apiSettings.topK}
              onChange={(e) =>
                setApiSettings((prev) => ({
                  ...prev,
                  topK: parseInt(e.target.value),
                }))
              }
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
              }`}
            />
            <div className={`flex justify-between text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span>Az (1)</span>
              <span className="font-medium">{apiSettings.topK}</span>
              <span>Çok (10)</span>
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              RAG Durumu
            </label>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="space-y-1">
                <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Sistem: <span className={ragStatus.system === 'ready' ? 'text-green-500' : 'text-red-500'}>{ragStatus.system}</span>
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ollama: <span className={ragStatus.ollama === 'online' ? 'text-green-500' : 'text-red-500'}>{ragStatus.ollama}</span>
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Model: <span className={ragStatus.model ? 'text-blue-500' : 'text-red-500'}>{ragStatus.model || 'yok'}</span>
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Dokümanlar: {ragStatus.documents}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPanel;
