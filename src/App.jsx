import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './frontend/context/AuthContext.jsx'
import Layout from './frontend/components/Layout.jsx'
import Login from './frontend/pages/Login.jsx'
import Signup from './frontend/pages/Signup.jsx'
import Dashboard from './frontend/pages/Dashboard.jsx'
import Generate from './frontend/pages/Generate.jsx'
import DatasetView from './frontend/pages/DatasetView.jsx'
import MyDatasets from './frontend/pages/MyDatasets.jsx'
import Templates from './frontend/pages/Templates.jsx'
import Settings from './frontend/pages/Settings.jsx'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="generate" element={<Generate />} />
        <Route path="dataset/:id" element={<DatasetView />} />
        <Route path="datasets" element={<MyDatasets />} />
        <Route path="templates" element={<Templates />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
