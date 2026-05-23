import type { MenuItem } from '../types';

export function MenuCard({ item, selected, onToggle }: { item: MenuItem; selected: boolean; onToggle: () => void }) {
  return (
    <button type="button" className={`menu-card ${selected ? 'selected' : ''}`} onClick={onToggle} disabled={!item.available}>
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
