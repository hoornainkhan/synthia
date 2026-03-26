import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './frontend/context/AuthContext.jsx'
import { DatasetProvider } from './frontend/context/DatasetContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DatasetProvider>
          <App />
        </DatasetProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
