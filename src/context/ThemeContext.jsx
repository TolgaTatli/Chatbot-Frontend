import { createContext, useContext, useState, useEffect } from 'react';
const ThemeContext = createContext();
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
export const ThemeProvider = ({ children }) => {
  // localStorage'dan tema tercihini yükle, yoksa sistem tercihini kullan
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    // Sistem tercihini kontrol et
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Tema değiştiğinde localStorage'a kaydet
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Body class'larını güncelle
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
    }
    
    return () => {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
    };
  }, [isDarkMode]);

  // Sistem tema tercihindeki değişiklikleri dinle
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Sadece localStorage'da kayıtlı tema yoksa sistem tercihini kullan
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === null) {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
