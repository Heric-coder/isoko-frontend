import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRoutes } from './App'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { SiteSettingsProvider } from '@/context/SiteSettingsContext'
import { ThemeProvider } from '@/context/ThemeContext'
import '@/styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <SiteSettingsProvider>
          <AuthProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </AuthProvider>
        </SiteSettingsProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
