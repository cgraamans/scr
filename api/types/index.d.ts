declare module 'node:http' {
    interface IncomingMessage {
      sessionID: string
    }
  }