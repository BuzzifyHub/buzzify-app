import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useColorScheme} from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('light');
  const [resolvedTheme, setResolvedTheme] = useState(systemTheme || 'light');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      const themeToUse = savedTheme || 'light';
      setThemeMode(themeToUse);
    };
    loadTheme();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setResolvedTheme(systemTheme || 'light');
    } else {
      setResolvedTheme(themeMode);
    }
  }, [themeMode, systemTheme]);

  const toggleTheme = async mode => {
    setThemeMode(mode);
    await AsyncStorage.setItem('themeMode', mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedTheme,
        toggleTheme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
