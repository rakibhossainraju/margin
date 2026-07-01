import * as api from './api';

// Expose API immediately at initialization for background-injected scripts
window.marginAPI = api;

console.log('[margin:content] content script initialized');

