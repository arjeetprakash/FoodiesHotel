import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('home');
  const navRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = ['home', 'features', 'spaces', 'events', 'faq'];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id || 'home');
      });
    }, { root: null, threshold: 0.45 });

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  // update CSS var for nav offset so sections can scroll to visible position
  useEffect(() => {
    const setOffset = () => {
      const h = navRef.current ? navRef.current.getBoundingClientRect().height : 80;
      document.documentElement.style.setProperty('--nav-offset', `${Math.ceil(h)}px`);
    };
    setOffset();
    window.addEventListener('resize', setOffset);
    return () => window.removeEventListener('resize', setOffset);
  }, []);

  // manage focus trap and body scroll when mobile menu opens
  useEffect(() => {
    const linksEl = linksRef.current;
    if (!linksEl) return;

    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(linksEl.querySelectorAll<HTMLElement>(focusableSelector));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    if (open) {
      // lock scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // focus first element
      setTimeout(() => focusable[0]?.focus(), 50);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const navH = navRef.current ? navRef.current.getBoundingClientRect().height : 0;
    const top = el.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <nav ref={navRef} className={`site-nav ${scrolled ? 'is-sticky' : ''}`} aria-label="Main navigation">
      <div className="site-nav-inner">
        <div className="nav-left">
          <Link to="/" className="brand">
            <div className="brand-mark small">FH</div>
            <strong>FoodiesHotel</strong>
          </Link>
        </div>

        <button
          ref={toggleRef}
          className={`nav-toggle ${open ? 'is-open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen((s) => !s)}
        >
          <svg width="26" height="18" viewBox="0 0 26 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2h22M2 9h22M2 16h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <div ref={linksRef} id="site-navigation" role="menu" className={`nav-links ${open ? 'is-open' : ''}`} aria-hidden={!open && window.innerWidth < 721}>
          <a role="menuitem" href="#home" className={active === 'home' ? 'is-active' : ''} onClick={(e) => handleAnchorClick(e, 'home')}>Home</a>
          <a role="menuitem" href="#features" className={active === 'features' ? 'is-active' : ''} onClick={(e) => handleAnchorClick(e, 'features')}>Features</a>
          <a role="menuitem" href="#spaces" className={active === 'spaces' ? 'is-active' : ''} onClick={(e) => handleAnchorClick(e, 'spaces')}>Spaces</a>
          <a role="menuitem" href="#events" className={active === 'events' ? 'is-active' : ''} onClick={(e) => handleAnchorClick(e, 'events')}>Events</a>
          <a role="menuitem" href="#faq" className={active === 'faq' ? 'is-active' : ''} onClick={(e) => handleAnchorClick(e, 'faq')}>FAQ</a>
          <Link role="menuitem" to="/login/customer" className="primary-button nav-cta" onClick={() => setOpen(false)}>Order Now</Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
