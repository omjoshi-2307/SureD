type GoogleCallback = (response: google.accounts.id.CredentialResponse) => void;

let initialized = false;
let currentCallback: GoogleCallback | null = null;
let pollingStarted = false;
let clientIdCache = '';

let hiddenButtonContainer: HTMLDivElement | null = null;
let hiddenButtonElement: HTMLElement | null = null;

function tryInitialize(clientId: string): void {
  if (initialized || !window.google?.accounts?.id || !clientId) return;
  initialized = true;
  clientIdCache = clientId;
  google.accounts.id.initialize({
    client_id: clientId,
    callback: handleCredentialResponse,
    cancel_on_tap_outside: false,
    auto_select: false,
  });
}

function handleCredentialResponse(response: google.accounts.id.CredentialResponse): void {
  if (currentCallback) {
    currentCallback(response);
  }
}

export function initGoogleSignIn(clientId: string): void {
  if (initialized || !clientId) return;
  tryInitialize(clientId);
  if (initialized) return;
  if (pollingStarted) return;
  pollingStarted = true;
  const interval = setInterval(() => {
    if (!initialized && window.google?.accounts?.id) {
      tryInitialize(clientId);
      clearInterval(interval);
    }
  }, 300);
  setTimeout(() => clearInterval(interval), 15000);
}

export function setGoogleCallback(callback: GoogleCallback | null): void {
  currentCallback = callback;
}

export function renderHiddenGoogleButton(): void {
  cleanupHiddenButton();
  if (!window.google?.accounts?.id || !clientIdCache) return;
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:200px;height:80px;opacity:0;pointer-events:none;z-index:-1';
  document.body.appendChild(container);
  hiddenButtonContainer = container;
  google.accounts.id.renderButton(container, {
    type: 'standard',
    shape: 'rectangular',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
  });
  hiddenButtonElement = container.querySelector('[role="button"]') as HTMLElement;
}

function cleanupHiddenButton(): void {
  if (hiddenButtonContainer && hiddenButtonContainer.parentNode) {
    hiddenButtonContainer.parentNode.removeChild(hiddenButtonContainer);
  }
  hiddenButtonContainer = null;
  hiddenButtonElement = null;
}

export function clickGoogleSignIn(): boolean {
  if (hiddenButtonElement) {
    hiddenButtonElement.click();
    return true;
  }
  return false;
}

export function destroyHiddenGoogleButton(): void {
  cleanupHiddenButton();
}

export function isGoogleInitialized(): boolean {
  return initialized;
}
