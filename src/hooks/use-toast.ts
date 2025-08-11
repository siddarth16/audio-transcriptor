'use client'

import { useState, useCallback, useRef } from 'react'
import { Toast } from '@/components/ui/toaster'

const DEFAULT_DURATION = 5000

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timeout = timeoutsRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutsRef.current.delete(id)
    }
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])
    
    const duration = toast.duration || DEFAULT_DURATION
    if (duration > 0) {
      const timeout = setTimeout(() => removeToast(id), duration)
      timeoutsRef.current.set(id, timeout)
    }
    
    return id
  }, [removeToast])

  const toast = {
    success: (title: string, description?: string, duration?: number) =>
      addToast({ type: 'success', title, description, duration }),
    
    error: (title: string, description?: string, duration?: number) =>
      addToast({ type: 'error', title, description, duration }),
    
    warning: (title: string, description?: string, duration?: number) =>
      addToast({ type: 'warning', title, description, duration }),
    
    info: (title: string, description?: string, duration?: number) =>
      addToast({ type: 'info', title, description, duration }),
  }

  return { toasts, addToast, removeToast, toast }
}