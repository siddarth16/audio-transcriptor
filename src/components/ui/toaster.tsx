'use client'

import React from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface Toast {
  id: string
  title?: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full max-w-sm p-4 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            rounded-lg p-4 shadow-lg border backdrop-blur-sm
            ${toast.type === 'success' && 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'}
            ${toast.type === 'error' && 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}
            ${toast.type === 'warning' && 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'}
            ${toast.type === 'info' && 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'}
            animate-in slide-in-from-bottom-full
          `}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-0.5">
              {toast.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
              {toast.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
              {toast.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
            </div>
            
            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className={`
                  text-sm font-medium
                  ${toast.type === 'success' && 'text-green-800 dark:text-green-200'}
                  ${toast.type === 'error' && 'text-red-800 dark:text-red-200'}
                  ${toast.type === 'warning' && 'text-yellow-800 dark:text-yellow-200'}
                  ${toast.type === 'info' && 'text-blue-800 dark:text-blue-200'}
                `}>
                  {toast.title}
                </div>
              )}
              
              {toast.description && (
                <div className={`
                  text-sm mt-1
                  ${toast.type === 'success' && 'text-green-700 dark:text-green-300'}
                  ${toast.type === 'error' && 'text-red-700 dark:text-red-300'}
                  ${toast.type === 'warning' && 'text-yellow-700 dark:text-yellow-300'}
                  ${toast.type === 'info' && 'text-blue-700 dark:text-blue-300'}
                `}>
                  {toast.description}
                </div>
              )}
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className={`
                flex-shrink-0 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${toast.type === 'success' && 'text-green-500 hover:bg-green-100 focus:ring-green-500 dark:hover:bg-green-900/50'}
                ${toast.type === 'error' && 'text-red-500 hover:bg-red-100 focus:ring-red-500 dark:hover:bg-red-900/50'}
                ${toast.type === 'warning' && 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-500 dark:hover:bg-yellow-900/50'}
                ${toast.type === 'info' && 'text-blue-500 hover:bg-blue-100 focus:ring-blue-500 dark:hover:bg-blue-900/50'}
              `}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}