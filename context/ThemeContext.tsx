import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { themes, ThemeName, AppTheme } from '../config/themes'

interface ThemeContextProps {
  theme: AppTheme
  setThemeByName: (name: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>('purple')

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user-theme')
        if (savedTheme && savedTheme in themes) {
          setCurrentThemeName(savedTheme as ThemeName)
        }
      } catch (err) {
        console.log('Erro ao carregar tema:', err)
      }
    }
    loadTheme()
  }, [])

  const setThemeByName = async (name: ThemeName) => {
    setCurrentThemeName(name)
    try {
      await AsyncStorage.setItem('user-theme', name)
    } catch (err) {
      console.log('Erro ao salvar tema:', err)
    }
  }

  const value = {
    theme: themes[currentThemeName],
    setThemeByName,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return context
}
