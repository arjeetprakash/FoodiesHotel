import { Link } from 'react-router-dom';
import { MenuActionIcon } from './MenuActionIcon';

export function BottomNav() {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Primary mobile navigation">
      <Link to="/" className="bottom-nav-item">
        <span aria-hidden="true"><MenuActionIcon name="home" /></span>
        <span className="bottom-nav-label">Home</span>
      </Link>
      <Link to="/customer" className="bottom-nav-item">
        <span aria-hidden="true"><MenuActionIcon name="menu" /></span>
        <span className="bottom-nav-label">Menu</span>
      </Link>
      <Link to="/cart" className="bottom-nav-item primary-cta">
        <span aria-hidden="true"><MenuActionIcon name="cart" /></span>
        <span className="bottom-nav-label">Order</span>
      </Link>
      <Link to="/profile" className="bottom-nav-item">
        <span aria-hidden="true"><MenuActionIcon name="profile" /></span>
        <span className="bottom-nav-label">Profile</span>
      </Link>
    </nav>
  );
}

export default BottomNav;
