import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MenuItem } from '../types';

gsap.registerPlugin(ScrollTrigger);

export function MenuCard({ item, selected, onToggle }: { item: MenuItem; selected: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLButtonElement | null>(null);

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
      <img src={item.image} alt={item.name} />
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
