export type MenuActionIconName = 'dashboard' | 'profile' | 'support' | 'logout' | 'home' | 'menu' | 'cart';

export function MenuActionIcon({ name }: { name: MenuActionIconName }) {
  if (name === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
      </svg>
    );
  }

  if (name === 'profile') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c1.8-3.4 5-5 8-5s6.2 1.6 8 5" />
      </svg>
    );
  }

  if (name === 'support') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    );
  }

  if (name === 'home') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 11.5L12 4l9 7.5" />
        <path d="M9 22V12h6v10" />
      </svg>
    );
  }

  if (name === 'menu') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h18" />
        <path d="M3 12h18" />
        <path d="M3 18h18" />
      </svg>
    );
  }

  if (name === 'cart') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="20" r="1" />
        <circle cx="20" cy="20" r="1" />
        <path d="M3 3h2l2.6 12.2A2 2 0 0 0 9.6 17h7.8a2 2 0 0 0 2-1.6L21 6H6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" />
      <path d="M14 8l6 4-6 4" />
      <path d="M20 12H9" />
    </svg>
  );
}
