import '@testing-library/jest-dom';
import 'whatwg-fetch';
import 'jest-axe/extend-expect';

// Polyfill for Node.js environment
import { TextDecoder, TextEncoder } from 'node:util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Enhanced fetch mock for better compatibility
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    clone: () => ({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    }),
  })
);

// Mock URL and URLSearchParams for older Node versions
if (typeof global.URL === 'undefined') {
  global.URL = require('node:url').URL;
}
if (typeof global.URLSearchParams === 'undefined') {
  global.URLSearchParams = require('node:url').URLSearchParams;
}

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(() => Promise.resolve()),
  })),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(() => Promise.resolve({ user: {} })),
  onAuthStateChanged: jest.fn(),
  setPersistence: jest.fn(() => Promise.resolve()),
  browserLocalPersistence: {},
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(),
  setAnalyticsCollectionEnabled: jest.fn(),
}));

// Mock services that might be imported
jest.mock('@/services/careerService', () => ({
  getCareerRecommendations: jest.fn(() =>
    Promise.resolve({
      careerStage: 'early',
      careerPaths: [],
    })
  ),
}));

// Mock UI components that might cause issues
jest.mock('@/components/ui/toast', () => ({
  Toast: ({ children, ...props }) => <div {...props}>{children}</div>,
  ToastAction: ({ children, ...props }) => <button {...props}>{children}</button>,
  ToastClose: ({ children, ...props }) => <button {...props}>{children}</button>,
  ToastDescription: ({ children, ...props }) => <div {...props}>{children}</div>,
  ToastProvider: ({ children, ...props }) => <div {...props}>{children}</div>,
  ToastTitle: ({ children, ...props }) => <div {...props}>{children}</div>,
  ToastViewport: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock BroadcastChannel for MSW
global.BroadcastChannel = class BroadcastChannel {
  constructor(name) {
    this.name = name;
  }
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {}
};

// Mock TransformStream for MSW
global.TransformStream = class TransformStream {
  constructor() {
    this.readable = new ReadableStream();
    this.writable = new WritableStream();
  }
};

// Mock ReadableStream and WritableStream if not available
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = class ReadableStream {
    getReader() {
      return {
        read: () => Promise.resolve({ done: true, value: undefined }),
        releaseLock: () => {},
      };
    }
  };
}

if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = class WritableStream {
    getWriter() {
      return {
        write: () => Promise.resolve(),
        close: () => Promise.resolve(),
        releaseLock: () => {},
      };
    }
  };
}
