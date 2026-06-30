import * as api from './api';
import { sendMessage } from '../shared/types';

// Expose API immediately at initialization for background-injected scripts
window.marginAPI = api;

/**
 * Secondary runtime safeguard. The manifest already restricts injection to
 * `.pdf` URLs, but we re-check the URL and document content-type to handle
 * dynamic responses and edge cases before sending any message.
 */
function isPdfDocument(): boolean {
  const url = window.location.href.toLowerCase();
  if (url.includes('.pdf')) {
    return true;
  }
  return document.contentType === 'application/pdf';
}

async function activate(): Promise<void> {
  if (!isPdfDocument()) {
    return;
  }

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
