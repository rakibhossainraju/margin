export enum ExtensionCommand {
  GET_SELECTION = 'get-selection',
  RELOAD_EXTENSION = 'reload-extension',
}

export interface MessageMap {
  PDF_ACTIVATED: {
    request: {
      url: string;
      timestamp: number;
    };
    response: {
      ok: boolean;
    };
  };
}

export type MessageType = keyof MessageMap;

export type MessageRequest<T extends MessageType> = MessageMap[T]['request'];
export type MessageResponse<T extends MessageType> = MessageMap[T]['response'];

export type ChromeMessage = {
  [K in MessageType]: {
    type: K;
  } & MessageMap[K]['request'];
}[MessageType];
