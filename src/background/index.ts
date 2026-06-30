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
 * Resolves the currently active tab in the last focused window.
 */
async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

interface ExecuteInTabOptions<TArgs extends any[], TResult> {
  tabId: number;
  func: (...args: TArgs) => TResult;
  args: TArgs;
}

/**
 * Executes a function in all frames of a given tab using chrome.scripting.executeScript.
 */
async function executeInTab<TArgs extends any[], TResult>({
  tabId,
  func,
  args,
}: ExecuteInTabOptions<TArgs, TResult>): Promise<TResult[]> {
  const executions = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    func,
    args,
  });

  return executions.map((execution) => execution.result as TResult);
}

/**
 * Handles the get-selection command by executing a selection retrieval script
 * in the active tab's frames.
 */
async function handleGetSelectionCommand(): Promise<void> {
  const tab = await getActiveTab();
  if (!tab?.id) {
    console.warn('[margin:background] no active tab found');
    return;
  }

  try {
    const results = await executeInTab({
      tabId: tab.id,
      func: () => {
        return window.marginAPI ? window.marginAPI.getSelectedText() : '';
      },
      args: [],
    });

    // Flatten multi-frame results and select the meaningful (non-empty) result
    const meaningfulResult = results.find((res) => res && res.trim() !== '') || '';
    console.log(`[margin:background] get-selection result: "${meaningfulResult}"`);
  } catch (error) {
    console.error('[margin:background] failed to execute command get-selection:', error);
  }
}

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
    case ExtensionCommand.GET_SELECTION:
      await handleGetSelectionCommand();
      break;

    case ExtensionCommand.RELOAD_EXTENSION:
      handleReloadExtensionCommand();
      break;

    default:
      console.warn(`[margin:background] unhandled command: ${commandString}`);
  }
});

console.log('[margin:background] service worker initialized');
