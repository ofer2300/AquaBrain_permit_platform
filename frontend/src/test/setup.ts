import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

// ResizeObserver
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || ResizeObserverPolyfill;

// matchMedia
if (!(globalThis as any).matchMedia) {
  (globalThis as any).matchMedia = (q: string) => ({
    matches: false, media: q, onchange: null,
    addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {},
    dispatchEvent() { return false; },
  });
}

// IntersectionObserver
if (!(globalThis as any).IntersectionObserver) {
  (globalThis as any).IntersectionObserver = class {
    observe() {} unobserve() {} disconnect() {}
  };
}

// WebSocket – לא פותח חיבור אמיתי בטסטים
class WS {
  readyState = 1;
  addEventListener() {} removeEventListener() {}
  send() {} close() {}
}
vi.stubGlobal('WebSocket', WS);

// TextEncoder/Decoder
try {
  const { TextEncoder, TextDecoder } = require('node:util');
  (globalThis as any).TextEncoder ||= TextEncoder;
  (globalThis as any).TextDecoder ||= TextDecoder;
} catch {}

// crypto.randomUUID
if (!(globalThis as any).crypto) (globalThis as any).crypto = {} as any;
(globalThis as any).crypto.randomUUID ||= (() =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  }));

// scrollTo
window.scrollTo = window.scrollTo || (() => {});

// Clipboard
if (!navigator.clipboard) {
  (navigator as any).clipboard = {
    writeText: vi.fn().mockResolvedValue(void 0),
    readText: vi.fn().mockResolvedValue(''),
  };
}

// עזר לסגירת מיקרו-טיקים בטסטים אסינכרוניים
export async function flushMicrotasks() {
  await Promise.resolve();
}
