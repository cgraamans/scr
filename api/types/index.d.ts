declare module 'node:http' {
  interface IncomingMessage {
    sessionID: string
  }
}

export namespace T {

  export namespace Params {

    export interface Items {

      dt?:number

    }

  }

}