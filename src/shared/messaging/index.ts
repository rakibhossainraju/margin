import {
  MessageType,
  MessageRequest,
  MessageResponse,
} from './protocol';

/**
 * Type-safe wrapper for sending messages from content scripts or popups to the background page.
 */
export function sendMessage<T extends MessageType>(
  type: T,
  request: MessageRequest<T>
): Promise<MessageResponse<T>> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, ...request }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Wraps a promise response to send back to the message sender, keeping the message channel open.
 * Always returns true as required by MV3 for async responses.
 */
export function wrapResponse<T>(
  promise: Promise<T>,
  sendResponse: (response: T) => void
): true {
  promise.then(sendResponse).catch((error) => {
    console.error('Async message handler failed:', error);
  });
  return true;
}

/**
 * Type signature for message handler functions.
 */
export type MessageHandler<T extends MessageType> = (
  request: MessageRequest<T>,
  sender: chrome.runtime.MessageSender
) => Promise<MessageResponse<T>> | MessageResponse<T>;

/**
 * Map of message handlers for the action router.
 */
export type MessageHandlers = {
  [K in MessageType]?: MessageHandler<K>;
};
