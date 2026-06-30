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
      case MessageType.PdfActivated:
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

async function getPdfSelection(tabId: number): Promise<string | null> {
  try {
    // Send a message directly to Chrome's native PDF plugin
    const response = await chrome.tabs.sendMessage(tabId, { type: "getSelectedText" });
    console.log('[margin: background] response :', response);
    if (response && response.selectedText) {
      return response.selectedText;
    }
  } catch (error) {
    // Throws an error if the page is not a PDF or not ready
    console.error("Could not fetch PDF selection:", error);
  }
  return null;
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "get-selection") {
    console.log('TAB_ID', tabId);
    if (tabId) {
      const text = await getPdfSelection(tabId);
      console.log('[margin: background] selected text: ', text);
      // Process your text data here
    }
  }
});

console.log('[margin:background] service worker initialized');
