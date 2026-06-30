import {
  MessageResponse,
  MessageType,
  PdfActivatedMessage,
} from '../shared/types';

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

function activate(): void {
  if (!isPdfDocument()) {
    return;
  }

  console.log(
    `[margin:content] content script active on PDF: ${window.location.href}`,
  );

  const message: PdfActivatedMessage = {
    type: MessageType.PDF_ACTIVATED,
    url: window.location.href,
    timestamp: Date.now(),
  };

  chrome.runtime.sendMessage(message, (response?: MessageResponse) => {
    if (chrome.runtime.lastError) {
      console.warn(
        '[margin:content] message failed:',
        chrome.runtime.lastError.message,
      );
      return;
    }
    console.log('[margin:content] background acknowledged:', response);
  });
}

activate();
