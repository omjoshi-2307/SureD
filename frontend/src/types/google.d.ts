/**
 * Minimal ambient typings for Google Identity Services (GSI).
 * The library is loaded globally via a <script> tag in index.html,
 * so these declarations only describe the surface this app touches.
 */
declare namespace google.accounts.id {
  interface CredentialResponse {
    credential: string;
    select_by?: string;
    clientId?: string;
  }

  interface IdConfiguration {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    cancel_on_tap_outside?: boolean;
    auto_select?: boolean;
  }

  interface GsiButtonConfiguration {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    width?: number;
  }

  function initialize(config: IdConfiguration): void;
  function renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
  function prompt(): void;
  function cancel(): void;
}

interface Window {
  google?: typeof google;
}
