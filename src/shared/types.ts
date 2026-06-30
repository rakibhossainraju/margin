/**
 * Strongly-typed message protocol shared between content script, background
 * service worker, and popup. Using a discriminated union keeps the messaging
 * contract explicit as more message kinds are added in later phases.
 */

export enum MessageType {
  PDF_ACTIVATED = 'PDF_ACTIVATED',
  GET_SELECTED_TEXT = 'GET_SELECTED_TEXT',
}

/** Sent by the content script when it confirms execution on a PDF page. */
export interface PdfActivatedMessage {
  type: MessageType.PDF_ACTIVATED;
  url: string;
  timestamp: number;
}

/** Union of all messages exchanged across extension contexts. */
export type ChromeMessage = PdfActivatedMessage;

/** Standard acknowledgement returned by message handlers. */
export interface MessageResponse {
  ok: boolean;
}
