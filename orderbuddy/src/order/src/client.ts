import { io } from 'socket.io-client'

export const client = io(import.meta.env.VITE_API_ENDPOINT as string)
