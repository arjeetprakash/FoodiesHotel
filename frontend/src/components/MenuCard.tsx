import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MenuItem } from '../types';

gsap.registerPlugin(ScrollTrigger);

function isLocalImageSource(src: string) {
  if (!src) {
    return false;
  }

  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return true;
  }

  if (src.startsWith('/')) {
    return true;
  }

  try {
    const url = new URL(src);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function createPlaceholderImage(name: string, category: string) {
  const safeName = name.slice(0, 28).replace(/&/g, '&amp;');
  const safeCategory = category.slice(0, 18).replace(/&/g, '&amp;');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${safeName}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="55%" stop-color="#1d4ed8" />
          <stop offset="100%" stop-color="#14b8a6" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" />
      <circle cx="1020" cy="120" r="220" fill="#f59e0b" opacity="0.18" />
      <circle cx="180" cy="680" r="240" fill="#38bdf8" opacity="0.18" />
      <rect x="72" y="72" width="1056" height="656" rx="48" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)" />
      <text x="108" y="350" fill="#ffffff" font-size="68" font-family="Arial, Helvetica, sans-serif" font-weight="700">${safeName}</text>
      <text x="108" y="430" fill="#dbeafe" font-size="34" font-family="Arial, Helvetica, sans-serif">${safeCategory}</text>
      <text x="108" y="520" fill="#ffffff" font-size="24" font-family="Arial, Helvetica, sans-serif" opacity="0.8">Fresh, fast, and locally prepared</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

export function MenuCard({ item, selected, onToggle }: { item: MenuItem; selected: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const imageSrc = isLocalImageSource(item.image) ? item.image : createPlaceholderImage(item.name, item.category);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const enter = () => gsap.to(el, { scale: 1.02, y: -6, boxShadow: '0 18px 40px rgba(23,32,51,0.12)', duration: 0.28, ease: 'power2.out' });
    const leave = () => gsap.to(el, { scale: 1, y: 0, boxShadow: '0 8px 30px rgba(23,32,51,0.06)', duration: 0.36, ease: 'power2.out' });

    el.addEventListener('mouseenter', enter);
    el.addEventListener('focus', enter);
    el.addEventListener('mouseleave', leave);
    el.addEventListener('blur', leave);

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => gsap.fromTo(el, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    });

    return () => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('focus', enter);
      el.removeEventListener('mouseleave', leave);
      el.removeEventListener('blur', leave);
      st.kill();
    };
  }, []);

  return (
    <button ref={ref} type="button" className={`menu-card ${selected ? 'selected' : ''}`} onClick={onToggle} disabled={!item.available}>
      <img src={imageSrc} alt={item.name} />
      <div className="menu-card-body">
        <div className="menu-card-top">
          <span>{item.category}</span>
          <strong>${item.price.toFixed(2)}</strong>
        </div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="menu-card-footer">
          <span>{item.featured ? 'Featured' : 'Popular'}</span>
          <span>{item.available ? 'Available' : 'Sold out'}</span>
        </div>
      </div>
    </button>
  );
}
