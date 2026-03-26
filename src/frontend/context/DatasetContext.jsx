import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'

const DatasetContext = createContext(null)

export function DatasetProvider({ children }) {
  const { user } = useAuth()
  const [datasets, setDatasets] = useState([])

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`synthia_datasets_${user.id}`)
      setDatasets(saved ? JSON.parse(saved) : [])
    } else {
      setDatasets([])
    }
  }, [user])

  const saveDatasets = (updated) => {
    setDatasets(updated)
    if (user) {
      localStorage.setItem(`synthia_datasets_${user.id}`, JSON.stringify(updated))
    }
  }

  const addDataset = (dataset) => {
    const newDataset = {
      ...dataset,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    saveDatasets([newDataset, ...datasets])
    return newDataset
  }

  const deleteDataset = (id) => {
    saveDatasets(datasets.filter(d => d.id !== id))
  }

  const getDataset = (id) => {
    return datasets.find(d => d.id === id)
  }

  return (
    <DatasetContext.Provider value={{ datasets, addDataset, deleteDataset, getDataset }}>
      {children}
    </DatasetContext.Provider>
  )
}

export function useDatasets() {
  const ctx = useContext(DatasetContext)
  if (!ctx) throw new Error('useDatasets must be used within DatasetProvider')
  return ctx
}
