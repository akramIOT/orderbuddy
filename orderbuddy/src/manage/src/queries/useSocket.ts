import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_WS_URL || 'http://localhost:3000', {
      withCredentials: true,
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  return socketRef.current
}
