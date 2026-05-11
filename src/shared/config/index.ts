/**
 * Application Configuration (Simplified & Production Ready)
 */

type DynamicApiConfig = {
  apiUrl?: string;
  socketApi?: string;
};

const isBrowser = typeof window !== 'undefined';
const defaultHost = isBrowser ? window.location.hostname : 'localhost';
const defaultProtocol = isBrowser ? window.location.protocol : 'http:';

// -----------------------------
// Base URLs (single source of truth)
// -----------------------------
export const API_BASE =
  import.meta.env.VITE_API_URL || `${defaultProtocol}//${defaultHost}:3000/api/v1`;

export const WS_BASE =
  import.meta.env.VITE_WS_URL || `${defaultProtocol}//${defaultHost}:3000`;

// Helper to get endpoint relative to apiClient's baseURL
const getRelativeEndpoint = (path: string) => {
  // Return path without leading slash to make it relative to baseURL in apiClient
  return path.replace(/^\/+/, '');
};

// -----------------------------
// Immutable App Config
// -----------------------------
export const APP_CONFIG = Object.freeze({
  API: {
    READ_VARIABLES: getRelativeEndpoint('variables/reading'),
    WRITE_VARIABLES: getRelativeEndpoint('variables/writing'),
    HEALTH: getRelativeEndpoint('health'),
  },

  STORAGE: {
    ITEMS: "app_items",
  },

  DEFAULTS: {
    Z_INDEX: 1,
    VARIABLE_VALUE: 0,
    DESIGN_RESOLUTION: {
      WIDTH: 1200,
      HEIGHT: 800,
    },
  },

  UI: {
    CANVAS_AUTO_SCALE_MARGIN: 50,
  },
} as const);

export type AppConfig = typeof APP_CONFIG;

// -----------------------------
// Helpers
// -----------------------------
const normalizeUrl = (url?: string | null): string | null =>
  url ? url.replace(/\/+$/, "") : null;

// -----------------------------
// Dynamic API resolver
// -----------------------------
export const resolveApiUrls = (
  appConfig?: DynamicApiConfig,
  _forceStandalone?: boolean
) => {
  let apiBaseOverride = normalizeUrl(appConfig?.apiUrl);
  let wsBaseOverride = normalizeUrl(appConfig?.socketApi);

  // Prevent persisted localhost from overriding deployed config or explicit .env configs
  if (
    apiBaseOverride &&
    (apiBaseOverride.includes("localhost") || apiBaseOverride.includes("127.0.0.1")) &&
    !API_BASE.includes("localhost") && !API_BASE.includes("127.0.0.1")
  ) {
    apiBaseOverride = null;
  }

  if (
    wsBaseOverride &&
    (wsBaseOverride.includes("localhost") || wsBaseOverride.includes("127.0.0.1")) &&
    !WS_BASE.includes("localhost") && !WS_BASE.includes("127.0.0.1")
  ) {
    wsBaseOverride = null;
  }

  const finalApiBase = apiBaseOverride || API_BASE;
  const finalWsBase = wsBaseOverride || WS_BASE;

  // For overrides, we want to return the absolute URL if it's an override,
  // or just the relative path if it's the default and we use apiClient.
  // Actually, variableApi.ts uses new URL() which REQUIRES an absolute URL or a base.

  // So let's provide a helper that works for both.
  const getUrl = (path: string) => {
    const normalizedBase = finalApiBase.replace(/\/+$/, '');
    const normalizedPath = path.replace(/^\/+/, '');
    return `${normalizedBase}/${normalizedPath}`;
  };

  return {
    readVariables: getUrl('variables/reading'),
    writeVariables: getUrl('variables/writing'),
    saveInput: getUrl('variable-readings'),
    functions: getUrl('variables/functions'),
    readingFunctions: getUrl('variables/reading/functions'),
    writingFunctions: getUrl('variables/writing/functions'),
    machineBasedOperations: getUrl('variables/writing/mbo'),
    health: getUrl(APP_CONFIG.API.HEALTH),
    ws: finalWsBase,
  };
};