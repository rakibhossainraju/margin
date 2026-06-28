import {
  ChromeMessage,
  MessageResponse,
  MessageType,
} from '../shared/types';

// Background service worker: listens for verification messages from the
// content script and logs confirmation, proving bidirectional messaging works.
chrome.runtime.onMessage.addListener(
  (
    message: ChromeMessage,
    _sender,
    sendResponse: (response: MessageResponse) => void,
  ) => {
    switch (message.type) {
      case MessageType.PdfActivated:
        console.log(
          `[margin:background] PDF activation confirmed for ${message.url} @ ${message.timestamp}`,
        );
        sendResponse({ ok: true });
        break;
      default:
        sendResponse({ ok: false });
    }
    // Response sent synchronously; no need to keep the channel open.
    return false;
  },
);

console.log('[margin:background] service worker initialized');
