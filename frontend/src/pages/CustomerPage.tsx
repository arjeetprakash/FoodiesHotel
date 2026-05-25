import { useEffect, useMemo, useState, useRef } from 'react';
import Skeleton from '../components/Skeleton';
import { fetchMenu, fetchOrders, placeOrder, fetchBranding } from '../lib/api';
import { useAuth } from '../lib/auth';
import { MenuCard } from '../components/MenuCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { Shell } from '../components/Shell';
import type { MenuItem, Order, Branding } from '../types';

interface CartEntry {
  item: MenuItem;
  quantity: number;
}

export function CustomerPage() {
  const { token } = useAuth();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [address, setAddress] = useState('12 Market Street, Downtown');
  const [paymentMethod, setPaymentMethod] = useState('Cash on delivery');
  const [transactionNo, setTransactionNo] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([fetchMenu(), token ? fetchOrders(token) : Promise.resolve({ orders: [] }), fetchBranding()])
      .then(([menuResponse, orderResponse, brandingResponse]) => {
        setMenu(menuResponse.items);
        setOrders(orderResponse.orders);
        setBranding(brandingResponse.branding);
        if (brandingResponse.branding.paymentQrCodeUrl) {
          setQrCodeUrl(brandingResponse.branding.paymentQrCodeUrl);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const total = useMemo(() => cart.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0), [cart]);

  const toggleCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.item.id === item.id);
      if (existing) {
        return current.filter((entry) => entry.item.id !== item.id);
      }

      return [...current, { item, quantity: 1 }];
    });
  };

  const incrementItem = (itemId: string) => {
    setCart((current) => current.map((entry) => (entry.item.id === itemId ? { ...entry, quantity: entry.quantity + 1 } : entry)));
  };

  const decrementItem = (itemId: string) => {
    setCart((current) =>
      current
        .map((entry) => (entry.item.id === itemId ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))
        .filter((entry) => entry.quantity > 0)
    );
  };

  const handleCheckout = async () => {
    if (!token || !cart.length) {
      return;
    }

    if (paymentMethod === 'Online' && !transactionNo) {
      setMessage('Please enter transaction number for online payment');
      return;
    }

    setMessage('');
    const response = await placeOrder(token, {
      items: cart.map((entry) => ({ menuItemId: entry.item.id, quantity: entry.quantity })),
      address,
      paymentMethod,
      paymentMode: paymentMethod === 'Online' ? 'online' : 'cash',
      qrCodeUrl: paymentMethod === 'Online' ? qrCodeUrl : '',
      transactionNo: paymentMethod === 'Online' ? transactionNo : ''
    });

    setOrders((current) => [response.order, ...current]);
    setCart([]);
    setTransactionNo('');
    setMessage('Order placed successfully.');
  };

  const menuGridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuGridRef.current) return;
    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray(menuGridRef.current!.children) as HTMLElement[];
      gsap.fromTo(
        nodes,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: menuGridRef.current, start: 'top 90%' } }
      );
    }, menuGridRef);

    return () => ctx.revert();
  }, [loading]);

  if (loading) {
    const placeholders = Array.from({ length: 6 }).map((_, i) => (
      <button key={i} type="button" className="menu-card" disabled>
        <span className="skeleton card-image" />
        <div className="menu-card-body">
          <div className="menu-card-top">
            <Skeleton width={80} height={14} />
            <Skeleton width={48} height={18} />
          </div>
          <Skeleton className="title" />
          <Skeleton className="line" />
          <div className="menu-card-footer">
            <Skeleton width={80} height={14} />
            <Skeleton width={72} height={14} />
          </div>
        </div>
      </button>
    ));

    return (
      <Shell title="Customer Dashboard" subtitle="Loading your menu...">
        <section className="dashboard-grid customer-layout">
          <div className="panel panel-wide">
            <div className="section-heading">
              <h3>Menu</h3>
              <p>Tap any card to add or remove it from the cart.</p>
            </div>
            <div ref={menuGridRef} className="menu-grid">
              {placeholders}
            </div>
          </div>

          <aside className="panel cart-panel">
            <div className="section-heading">
              <h3>Cart</h3>
              <p>--</p>
            </div>
            <div className="cart-list">
              <div className="cart-row">
                <div>
                  <Skeleton width={140} height={16} />
                  <Skeleton width={80} height={12} />
                </div>
                <div className="cart-controls">
                  <Skeleton width={36} height={28} style={{ borderRadius: 8 }} />
                  <Skeleton width={28} height={16} style={{ borderRadius: 6 }} />
                  <Skeleton width={36} height={28} style={{ borderRadius: 8 }} />
                </div>
              </div>
            </div>
            <Skeleton width="100%" height={80} style={{ marginTop: 12, borderRadius: 12 }} />
            <div className="cart-total" style={{ marginTop: 12 }}>
              <span>Total</span>
              <strong>--</strong>
            </div>
            <Skeleton width="100%" height={44} style={{ marginTop: 12, borderRadius: 12 }} />
          </aside>

          <div className="panel panel-wide customer-history">
            <div className="section-heading">
              <h3>Order history</h3>
              <p>Your latest deliveries and their status.</p>
            </div>

            <div className="order-list">
              <article className="order-card">
                <div>
                  <Skeleton width={140} height={18} />
                  <Skeleton width={100} height={12} />
                </div>
                <Skeleton width={200} height={12} />
                <Skeleton width={72} height={20} />
              </article>
            </div>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell title="Customer Dashboard" subtitle="Browse the menu, build your cart, and place new orders.">
      <section className="dashboard-grid customer-layout">
        <div className="panel panel-wide">
          <div className="section-heading">
            <h3>Menu</h3>
            <p>Tap any card to add or remove it from the cart.</p>
          </div>
          <div ref={menuGridRef} className="menu-grid">
            {menu.map((item) => (
              <MenuCard key={item.id} item={item} selected={cart.some((entry) => entry.item.id === item.id)} onToggle={() => toggleCart(item)} />
            ))}
          </div>
        </div>

        <aside className="panel cart-panel">
          <div className="section-heading">
            <h3>Cart</h3>
            <p>{cart.length} item(s)</p>
          </div>

          <div className="cart-list">
            {cart.length === 0 ? <div className="empty-state">Your cart is empty.</div> : null}
            {cart.map((entry) => (
              <div className="cart-row" key={entry.item.id}>
                <div>
                  <strong>{entry.item.name}</strong>
                  <span>${entry.item.price.toFixed(2)}</span>
                </div>
                <div className="cart-controls">
                  <button type="button" onClick={() => decrementItem(entry.item.id)}>-</button>
                  <span>{entry.quantity}</span>
                  <button type="button" onClick={() => incrementItem(entry.item.id)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <label>
            Delivery address
            <textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={3} />
          </label>

          <label>
            Payment method
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              <option>Cash on delivery</option>
              <option>Online</option>
              <option>Wallet</option>
            </select>
          </label>

          {paymentMethod === 'Online' && (
            <>
              <div className="online-payment-info">
                <p><strong>Scan the QR code below to pay:</strong></p>
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="Payment QR Code" style={{ maxWidth: '200px', margin: '10px 0' }} />
                )}
              </div>
              <label>
                Transaction Number
                <input
                  type="text"
                  value={transactionNo}
                  onChange={(event) => setTransactionNo(event.target.value)}
                  placeholder="Enter transaction ID after payment"
                />
              </label>
            </>
          )}

          <div className="cart-total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>

          <button type="button" className="primary-button" onClick={handleCheckout} disabled={!cart.length}>
            Place order
          </button>
          {message ? <div className="success-banner">{message}</div> : null}
        </aside>

        <div className="panel panel-wide customer-history">
          <div className="section-heading">
            <h3>Order history</h3>
            <p>Your latest deliveries and their status.</p>
          </div>
          <div className="order-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div>
                  <strong>{order.status.replaceAll('_', ' ')}</strong>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <p>{order.items.map((item) => `${item.quantity} x ${item.name}`).join(', ')}</p>
                <strong>${order.total.toFixed(2)}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
