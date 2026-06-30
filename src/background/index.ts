import {
  ChromeMessage,
  MessageResponse,
  MessageType,
} from '../shared/types';

let tabId: number | undefined;

// Background service worker: listens for verification messages from the
// content script and logs confirmation, proving bidirectional messaging works.
chrome.runtime.onMessage.addListener(
  (
    message: ChromeMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void,
  ) => {
    switch (message.type) {
      case MessageType.PDF_ACTIVATED:
        tabId = sender.tab?.id;
        console.log(
          `[margin:background] PDF activation confirmed for ${message.url} tabId=${tabId}`,
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
