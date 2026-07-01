import * as api from './api';
import { sendMessage } from '../shared/types';

// Expose API immediately at initialization for background-injected scripts
window.marginAPI = api;

async function activate(): Promise<void> {
  console.log(
    `[margin:content] content script active on PDF: ${window.location.href}`
  );

  try {
    const response = await sendMessage('PDF_ACTIVATED', {
      url: window.location.href,
      timestamp: Date.now(),
    });
    console.log('[margin:content] background acknowledged:', response);
  } catch (error) {
    console.warn('[margin:content] message failed:', error);
  }
}

activate();
