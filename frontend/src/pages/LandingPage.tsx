import { useEffect, useState, type CSSProperties, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchBranding } from '../lib/api';
import type { Branding } from '../types';
import { NavBar } from '../components/NavBar';
import Skeleton from '../components/Skeleton';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const highlights = [
  { label: 'Live menu', value: '45+' },
  { label: 'Orders today', value: '128' },
  { label: 'Delivery time', value: '28 min' }
];

export function LandingPage() {
  const [branding, setBranding] = useState<Branding | null>(null);
  const themeStyle = branding?.primaryColor ? ({ '--brand': branding.primaryColor } as CSSProperties) : undefined;

  useEffect(() => {
    fetchBranding()
      .then((response) => setBranding(response.branding))
      .catch(() => undefined);
  }, []);

  return (
    <div className="landing-page" style={themeStyle}>
      <NavBar />

      <section id="home" className="hero-panel hero-full" style={branding?.heroImageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(14,18,32,0.25), rgba(14,18,32,0.18)), url(${branding.heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
        <div className="hero-overlay" />
        <div className={`hero-copy ${!branding ? 'skeleton-wrap loading' : 'skeleton-wrap'}`} ref={(el) => {
          if (!el) return;
        }}>
          <span className="eyebrow">Restaurant commerce reimagined</span>
          {!branding ? (
            <>
              <Skeleton className="title" />
              <Skeleton className="line" />
              <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                <Skeleton width={140} height={44} style={{ borderRadius: 12 }} />
                <Skeleton width={120} height={44} style={{ borderRadius: 12 }} />
              </div>
            </>
          ) : (
            <>
              <h1>Delicious Food Delivered Fresh</h1>
              <p>
                {branding?.restaurantName ?? 'FoodiesHotel'} gives customers a fast ordering experience and gives your admin team full control over
                menu, orders, and customer data.
              </p>

              <div className="hero-actions">
                <Link to="/login/customer" className="primary-button">Order Now</Link>
                <a href="#features" className="secondary-button">Explore Menu</a>
              </div>
            </>
          )}
        </div>

        <div className="hero-metrics" ref={(el) => {
          if (!el) return;
          gsap.fromTo(el.children, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 80%' } });
        }}>
          {highlights.map((item) => (
            <article key={item.label} className="metric-card">
              {!branding ? (
                <>
                  <Skeleton className="title" />
                  <Skeleton className="small" />
                </>
              ) : (
                <>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="feature-grid">
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
