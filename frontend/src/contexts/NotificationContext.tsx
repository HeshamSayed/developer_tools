import { createContext, useContext, useState, ReactNode } from 'react'
import SuccessNotification from '@/components/Common/SuccessNotification'

interface Notification {
  id: string
  message: string
  type: 'success' | 'error'
}

interface NotificationContextType {
  showSuccess: (message: string) => void
  showError: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showSuccess = (message: string) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message, type: 'success' }])
    setTimeout(() => removeNotification(id), 5000)
  }

  const showError = (message: string) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message, type: 'error' }])
    setTimeout(() => removeNotification(id), 7000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ showSuccess, showError }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          notification.type === 'success' ? (
            <SuccessNotification
              key={notification.id}
              message={notification.message}
              onClose={() => removeNotification(notification.id)}
            />
          ) : (
            <div
              key={notification.id}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg min-w-[300px] max-w-md"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
