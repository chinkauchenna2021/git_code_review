import { useAppStore } from './store'

export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null

  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return

    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/ws`
      : 'ws://localhost:3001/ws'

    this.ws = new WebSocket(`${wsUrl}?userId=${userId}`)

    this.ws.onopen = () => {
      console.log('🔗 WebSocket connected')
      this.reconnectAttempts = 0
      
      const store = useAppStore.getState()
      store.connect()
      
      // Start heartbeat
      this.startHeartbeat()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason)
      
      const store = useAppStore.getState()
      store.disconnect()
      
      this.stopHeartbeat()
      
      if (event.code !== 1000) { // Not a normal closure
        this.attemptReconnect(userId)
      }
    }

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
    }
  }

  private handleMessage(data: any) {
    const store = useAppStore.getState()

    switch (data.type) {
      case 'review_progress':
        store.subscribeToReview(data.reviewId)
        break

      case 'review_completed':
        store.fetchReview(data.reviewId)
        store.addNotification({
          type: 'success',
          title: 'Review Completed',
          message: `AI analysis for PR #${data.pullRequestNumber} is complete`,
          duration: 5000
        })
        store.unsubscribeFromReview(data.reviewId)
        break

      case 'critical_issue':
        store.addNotification({
          type: 'warning',
          title: 'Critical Issue Found',
          message: `Critical security issue detected in ${data.repository}`,
          duration: 0 // Persistent notification
        })
        break

      case 'team_invitation':
        store.fetchTeams()
        store.addNotification({
          type: 'info',
          title: 'Team Invitation',
          message: `You've been invited to join ${data.teamName}`,
          duration: 10000
        })
        break

      case 'subscription_updated':
        store.fetchSubscription()
        break

      case 'heartbeat':
        // Respond to heartbeat
        this.send({ type: 'heartbeat_ack' })
        break

      default:
        console.log('Unknown WebSocket message type:', data.type)
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'heartbeat' })
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnect(userId: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached')
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    
    setTimeout(() => {
      this.reconnectAttempts++
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      this.connect(userId)
    }, delay)
  }

  disconnect() {
    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.reconnectAttempts = 0
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket not connected. Message not sent:', data)
    }
  }

  getConnectionState(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'error'
    }
  }
}

export const wsManager = new WebSocketManager()
