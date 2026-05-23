import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { fetchBranding, recordWebsiteVisit } from '../lib/api';
import type { Branding } from '../types';

export function Shell({
  title,
  subtitle,
  children,
  variant = 'default'
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  variant?: 'default' | 'admin';
}) {
  const { user, logout } = useAuth();
  const [branding, setBranding] = useState<Branding | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchBranding()
      .then((response) => setBranding(response.branding))
      .catch(() => undefined);

    const visitKey = 'foodieshotel-visit-recorded';
    if (!sessionStorage.getItem(visitKey)) {
      sessionStorage.setItem(visitKey, '1');
      recordWebsiteVisit().catch(() => undefined);
    }
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={variant === 'admin' ? 'app-shell app-shell-admin' : 'app-shell'}>
      {variant === 'admin' ? (
        <header className="admin-topbar">
          <div className="admin-topbar-brand">
            <div className="brand-mark">FH</div>
            <div>
              <strong>{branding?.restaurantName ?? 'FoodiesHotel'}</strong>
              <span>{title}</span>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <div className="profile-chip profile-chip-compact">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>

            <div className="overflow-menu-wrap">
              <button type="button" className="overflow-button" onClick={() => setMenuOpen((current) => !current)} aria-label="Open admin menu" aria-expanded={menuOpen} aria-haspopup="dialog">
                ⋮
              </button>

              <div className={`overflow-drawer ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
                <button type="button" className="overflow-backdrop" onClick={closeMenu} aria-label="Close admin menu" />
                <div className="overflow-menu" role="dialog" aria-label="Admin menu">
                  <div className="overflow-menu-header">
                    <strong>Quick actions</strong>
                    <button type="button" className="overflow-close" onClick={closeMenu} aria-label="Close menu">×</button>
                  </div>
                  <Link to={user?.role === 'admin' ? '/admin' : '/customer'} onClick={closeMenu}>Dashboard</Link>
                  {user?.role === 'customer' && <Link to="/profile" onClick={closeMenu}>My Profile</Link>}
                  <a href={`mailto:${branding?.supportEmail ?? 'support@foodieshotel.com'}`} onClick={closeMenu}>Support</a>
                  <button type="button" onClick={() => { closeMenu(); logout(); }}>Log out</button>
                </div>
              </div>
            </div>
          </div>
        </header>
      ) : (
      <aside className="sidebar">
        <div>
          <div className="brand-mark">FH</div>
          <h1>{branding?.restaurantName ?? 'FoodiesHotel'}</h1>
          <p>{branding?.tagline ?? 'Fresh meals. Fast delivery. Full control.'}</p>
        </div>

        <nav className="sidebar-nav">
          <Link to={user?.role === 'admin' ? '/admin' : '/customer'}>Dashboard</Link>
          {user?.role === 'customer' && <Link to="/profile">My Profile</Link>}
          <a href={`mailto:${branding?.supportEmail ?? 'support@foodieshotel.com'}`}>Support</a>
        </nav>

        <button type="button" className="ghost-button" onClick={logout}>Log out</button>
      </aside>
      )}

      <main className="content-area">
        <header className={variant === 'admin' ? 'page-header page-header-admin' : 'page-header'}>
          <div>
            <span className="eyebrow">{user?.role?.toUpperCase()}</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {variant !== 'admin' && (
            <div className="profile-chip">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          )}
        </header>

        {children}
      </main>
    </div>
  );
}
