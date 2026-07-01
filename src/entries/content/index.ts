import { getSelectedText } from '@adapters/html/selection';

// Expose API immediately at initialization for background-injected scripts
window.marginAPI = { getSelectedText };

console.log('[margin:content] content script initialized');

