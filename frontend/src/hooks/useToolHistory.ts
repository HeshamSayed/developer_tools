import { useState, useEffect } from 'react'

interface ToolHistoryItem {
  toolSlug: string
  toolName: string
  timestamp: number
}

const MAX_HISTORY_ITEMS = 20

export const useToolHistory = () => {
  const [history, setHistory] = useState<ToolHistoryItem[]>([])

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('toolHistory')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse tool history', e)
      }
    }
  }, [])

  const addToHistory = (toolSlug: string, toolName: string) => {
    const newHistory = [
      { toolSlug, toolName, timestamp: Date.now() },
      ...history.filter(item => item.toolSlug !== toolSlug)
    ].slice(0, MAX_HISTORY_ITEMS)

    setHistory(newHistory)
    localStorage.setItem('toolHistory', JSON.stringify(newHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('toolHistory')
  }

  return { history, addToHistory, clearHistory }
}
