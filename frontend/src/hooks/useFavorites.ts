import { useState, useEffect } from 'react'

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    // Load favorites from localStorage
    const saved = localStorage.getItem('toolFavorites')
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse favorites', e)
      }
    }
  }, [])

  const toggleFavorite = (toolSlug: string) => {
    const newFavorites = favorites.includes(toolSlug)
      ? favorites.filter(slug => slug !== toolSlug)
      : [...favorites, toolSlug]

    setFavorites(newFavorites)
    localStorage.setItem('toolFavorites', JSON.stringify(newFavorites))
  }

  const isFavorite = (toolSlug: string) => favorites.includes(toolSlug)

  return { favorites, toggleFavorite, isFavorite }
}
