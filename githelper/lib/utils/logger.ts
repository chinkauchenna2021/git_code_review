interface LogContext {
  userId?: string
  requestId?: string
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? JSON.stringify(context) : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${contextStr}`
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error?.message,
      stack: this.isDevelopment ? error?.stack : undefined
    }
    console.error(this.formatMessage('error', message, errorContext))
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }
}

export const logger = new Logger()
