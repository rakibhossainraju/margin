/**
 * Portions of this file are derived from jeromepl/highlighter
 * Copyright (c) 2020 Jérôme Parent-Lévesque
 * Licensed under the MIT License
 */

import {
  ExtensionCommand,
  MessageHandlers,
  MessageType,
  wrapResponse,
} from '../shared/types';

// Top-level message handlers router mapping
const handlers: MessageHandlers = {
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

  const handler = handlers[message.type as MessageType];
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

/**
 * Dynamically sets up declarativeNetRequest rules to redirect local PDF loads to the viewer.
 * Dynamic rules allow us to use the runtime extension ID in the redirection URL.
 */
async function setupDnrRules(): Promise<void> {
  const ruleId = 1;
  const targetRule = {
    id: ruleId,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        regexSubstitution: `chrome-extension://${chrome.runtime.id}/viewer.html?file=file://\\1`,
      },
    },
    condition: {
      regexFilter: '^file://(.*\\.pdf.*)$',
      resourceTypes: ['main_frame'],
    },
  };

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId],
      addRules: [targetRule as any],
    });
    console.log('[margin:background] Dynamic DNR rules updated successfully');
  } catch (error) {
    console.error('[margin:background] Failed to update dynamic DNR rules:', error);
  }
}

// Initialize dynamic rules
setupDnrRules().catch((err) => {
  console.error('[margin:background] Error in setupDnrRules call:', err);
});

console.log('[margin:background] service worker initialized');

