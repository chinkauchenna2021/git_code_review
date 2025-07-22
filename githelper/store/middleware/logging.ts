import { StateCreator } from 'zustand'

export const loggingMiddleware = <T>(
  f: StateCreator<T>,
  name?: string
): StateCreator<T> => (set: (arg0: any) => void, get: any, api: any) =>
  f(
    (...args) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 ${name || 'Store'} updated:`, args)
      }
      set(...args)
    },
    get,
    api
  )
