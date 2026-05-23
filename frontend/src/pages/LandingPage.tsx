import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBranding } from '../lib/api';
import type { Branding } from '../types';

const highlights = [
  { label: 'Live menu', value: '45+' },
  { label: 'Orders today', value: '128' },
  { label: 'Delivery time', value: '28 min' }
];

export function LandingPage() {
  const [branding, setBranding] = useState<Branding | null>(null);

  useEffect(() => {
    fetchBranding()
      .then((response) => setBranding(response.branding))
      .catch(() => undefined);
  }, []);

  return (
    <div className="landing-page">
      <section className="hero-panel" style={branding?.heroImageUrl ? { backgroundImage: `linear-gradient(rgba(255,250,243,0.9), rgba(255,250,243,0.88)), url(${branding.heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
        <div className="hero-copy">
          <span className="eyebrow">Restaurant commerce reimagined</span>
          <h1>Run your food delivery brand with one polished web platform.</h1>
          <p>
            {branding?.restaurantName ?? 'FoodiesHotel'} gives customers a fast ordering experience and gives your admin team full control over
            menu, orders, and customer data.
          </p>

          <div className="hero-actions">
            <Link to="/login/customer" className="primary-button">Customer login</Link>
            <Link to="/login/admin" className="secondary-button">Admin login</Link>
          </div>
        </div>

        <div className="hero-metrics">
          {highlights.map((item) => (
            <article key={item.label} className="metric-card">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-grid">
        <article>
          <h3>Customer-first ordering</h3>
          <p>Quick menu discovery, cart building, and order tracking in one clean flow.</p>
        </article>
        <article>
          <h3>Admin control center</h3>
          <p>Update food items, manage all orders, and view every customer record from the dashboard.</p>
        </article>
        <article>
          <h3>Separation by design</h3>
          <p>The frontend and backend live in separate folders so they are easy to identify and evolve.</p>
        </article>
      </section>
    </div>
  );
}
