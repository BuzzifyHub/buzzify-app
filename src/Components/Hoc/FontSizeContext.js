import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FontSizeContext = createContext();
const FONT_SIZE_KEY = 'APP_FONT_SIZE';

export const FontSizeProvider = ({children}) => {
  const [fontSizeLevel, setFontSizeLevel] = useState('default');

  // Load saved font size on mount
  useEffect(() => {
    const loadFontSize = async () => {
      try {
        const storedFontSize = await AsyncStorage.getItem(FONT_SIZE_KEY);
        if (storedFontSize) {
          setFontSizeLevel(storedFontSize);
        }
      } catch (error) {
        // Ignore error silently — optionally track it in crash tool if needed
      }
    };

    loadFontSize();
  }, []);

  const changeFontSize = async level => {
    try {
      await AsyncStorage.setItem(FONT_SIZE_KEY, level);
      setFontSizeLevel(level);
    } catch (error) {
      // Ignore error silently — optionally track it in crash tool if needed
    }
  };

  const getSizeMultiplier = () => {
    switch (fontSizeLevel) {
      case 'large':
        return 1.1;
      case 'small':
        return 0.8;
      default:
        return 0.9;
    }
  };

  return (
    <FontSizeContext.Provider
      value={{
        fontSizeLevel,
        setFontSizeLevel: changeFontSize, // 👈 use this to persist
        getSizeMultiplier,
      }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => useContext(FontSizeContext);
