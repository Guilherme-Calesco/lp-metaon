export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  capturedAt?: string;
  landingPage?: string;
  referrer?: string;
}

const UTM_STORAGE_KEY = 'metaon_utm_params';

export function captureUTMFromURL(): UTMParams {
  const params = new URLSearchParams(window.location.search);
  const utm: UTMParams = {};

  if (params.get('utm_source')) utm.utm_source = params.get('utm_source')!;
  if (params.get('utm_medium')) utm.utm_medium = params.get('utm_medium')!;
  if (params.get('utm_campaign')) utm.utm_campaign = params.get('utm_campaign')!;

  return utm;
}

export function saveUTMToSession(utm: UTMParams): void {
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({
      ...utm,
      capturedAt: new Date().toISOString(),
      landingPage: window.location.href,
      referrer: document.referrer || undefined
    }));
  }
}

export function getUTMFromSession(): UTMParams | null {
  const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function buildDashboardURLWithUTM(baseUrl: string): string {
  const storedUTM = getUTMFromSession();
  if (!storedUTM) return baseUrl;

  const url = new URL(baseUrl);
  if (storedUTM.utm_source) url.searchParams.set('utm_source', storedUTM.utm_source);
  if (storedUTM.utm_medium) url.searchParams.set('utm_medium', storedUTM.utm_medium);
  if (storedUTM.utm_campaign) url.searchParams.set('utm_campaign', storedUTM.utm_campaign);

  return url.toString();
}

export function initUTMTracking(): void {
  const currentUTM = captureUTMFromURL();
  if (Object.keys(currentUTM).length > 0) {
    saveUTMToSession(currentUTM);
  }
}
