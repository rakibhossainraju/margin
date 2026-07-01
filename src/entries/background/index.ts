import {
  ExtensionCommand,
  MessageType,
  MessageRequest,
  MessageResponse,
} from '@shared/messaging/protocol';
import { wrapResponse } from '@infrastructure/messaging';
import { setupDnrRules } from '@infrastructure/dnr/redirectRules';

type MessageHandler<T extends MessageType> = (
  request: MessageRequest<T>,
  sender: chrome.runtime.MessageSender
) => Promise<MessageResponse<T>> | MessageResponse<T>;

type MessageHandlers = {
  [K in MessageType]?: MessageHandler<K>;
};

// Top-level message handlers router mapping
const messageHandlers: MessageHandlers = {
  PDF_ACTIVATED: (request, sender) => {
    const tabId = sender.tab?.id;
    console.log(
      `[margin:background] PDF activation confirmed for ${request.url} tabId=${tabId}`
    );
    return { ok: true };
  },
};

// Register a single top-level runtime.onMessage listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object' || !message.type) {
    return false;
  }

  const handler = messageHandlers[message.type as MessageType];
  if (handler) {
    try {
      const result = handler(message, sender);
      if (result instanceof Promise) {
        return wrapResponse(result, sendResponse);
      } else {
        sendResponse(result);
        return false;
      }
    } catch (error) {
      console.error(`Error in handler for ${message.type}:`, error);
      return false;
    }
  }

  // Unknown action, ignore and do not throw
  return false;
});


/**
 * Handles the reload-extension command by reloading the browser extension.
 */
function handleReloadExtensionCommand(): void {
  chrome.runtime.reload();
}

// Commands listener (routing all extension shortcut commands)
chrome.commands.onCommand.addListener(async (commandString) => {
  console.log(`[margin:background] command triggered: ${commandString}`);
  const command = commandString as ExtensionCommand;

  switch (command) {
    case ExtensionCommand.RELOAD_EXTENSION:
      handleReloadExtensionCommand();
      break;

    default:
      console.warn(`[margin:background] unhandled command: ${commandString}`);
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "execute_browser_action") {
    chrome.runtime.reload();
  }
});

// Initialize dynamic rules
setupDnrRules().catch((err) => {
  console.error('[margin:background] Error in setupDnrRules call:', err);
});

console.log('[margin:background] service worker initialized');
