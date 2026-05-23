import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { fetchBranding } from '../lib/api';
import type { Branding } from '../types';

export function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [branding, setBranding] = useState<Branding | null>(null);

  useEffect(() => {
    fetchBranding()
      .then((response) => setBranding(response.branding))
      .catch(() => undefined);
  }, []);

  return (
    <div className="app-shell">
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

      <main className="content-area">
        <header className="page-header">
          <div>
            <span className="eyebrow">{user?.role?.toUpperCase()}</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="profile-chip">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
