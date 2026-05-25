import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import {
  createMenuItem,
  deleteMenuItem,
  fetchAdminAnalytics,
  fetchAdminBranding,
  fetchAdminMenu,
  fetchAdminOrders,
  fetchAdminSummary,
  fetchAdminUsers,
  updateAdminBranding,
  updateMenuItem,
  updateOrderStatus,
  uploadAdminImage
} from '../lib/api';
import { verifyOrder } from '../lib/api';
import { useAuth } from '../lib/auth';
import Skeleton from '../components/Skeleton';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { Shell } from '../components/Shell';
import type { AdminAnalytics, AdminCustomer, Branding, MenuItem, Order } from '../types';

const blankItem: Omit<MenuItem, 'id'> = {
  name: '',
  description: '',
  category: '',
  price: 0,
  image: '',
  featured: false,
  available: true
};

export function AdminPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'menu' | 'orders' | 'customers'>('dashboard');
  const [summary, setSummary] = useState<{ customers: number; admins: number; items: number; orders: number; revenue: number; visitors: number } | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState<1 | 7 | 30>(7);
  const [users, setUsers] = useState<AdminCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [form, setForm] = useState(blankItem);
  const [statusMessage, setStatusMessage] = useState('');
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    if (!token) {
      return;
    }

    Promise.all([
      fetchAdminSummary(token),
      fetchAdminAnalytics(token, analyticsRange),
      fetchAdminUsers(token),
      fetchAdminOrders(token),
      fetchAdminMenu(token),
      fetchAdminBranding(token)
    ])
      .then(([summaryResponse, analyticsResponse, usersResponse, ordersResponse, menuResponse, brandingResponse]) => {
        setSummary(summaryResponse.summary);
        setAnalytics(analyticsResponse.analytics);
        setUsers(usersResponse.users);
        setOrders(ordersResponse.orders);
        setMenu(menuResponse.items);
        setBranding(brandingResponse.branding);
      });
  }, [token, analyticsRange]);

  useEffect(() => {
    if (activeTab !== 'customers') {
      setSelectedCustomer(null);
    }
  }, [activeTab]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const refresh = async () => {
    if (!token) {
      return;
    }

    const [summaryResponse, analyticsResponse, usersResponse, ordersResponse, menuResponse, brandingResponse] = await Promise.all([
      fetchAdminSummary(token),
      fetchAdminAnalytics(token, analyticsRange),
      fetchAdminUsers(token),
      fetchAdminOrders(token),
      fetchAdminMenu(token),
      fetchAdminBranding(token)
    ]);

    setSummary(summaryResponse.summary);
    setAnalytics(analyticsResponse.analytics);
    setUsers(usersResponse.users);
    setOrders(ordersResponse.orders);
    setMenu(menuResponse.items);
    setBranding(brandingResponse.branding);
  };

  const saveItem = async () => {
    if (!token) {
      return;
    }

    if (menu.some((item) => item.name === form.name)) {
      setForm(blankItem);
      return;
    }

    await createMenuItem(token, form);
    setForm(blankItem);
    await refresh();
  };

  const saveBranding = async () => {
    if (!token || !branding) {
      return;
    }

    await updateAdminBranding(token, branding);
    setStatusMessage('Branding updated.');
    await refresh();
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>, target: 'logoUrl' | 'heroImageUrl' | 'paymentQrCodeUrl') => {
    if (!token || !event.target.files?.[0] || !branding) {
      return;
    }

    const response = await uploadAdminImage(token, event.target.files[0]);
    setBranding({ ...branding, [target]: response.imageUrl });
    const labels = { logoUrl: 'Logo', heroImageUrl: 'Hero image', paymentQrCodeUrl: 'Payment QR code' };
    setStatusMessage(`${labels[target]} uploaded.`);
  };

  const formatDayLabel = (value: string) => new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'menu', label: 'Menu' },
    { id: 'orders', label: 'Orders' },
    { id: 'customers', label: 'Customers' }
  ] as const;

  const footerTime = currentDateTime.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <Shell title="Admin Dashboard" subtitle="Manage the complete restaurant website from one control room." variant="admin">
      <section className="dashboard-grid admin-grid">
        {activeTab === 'dashboard' && (
          <div className="stats-row" ref={(el) => {
            if (!el) return;
            gsap.fromTo(Array.from(el.children), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
          }}>
            {analytics ? (
              <>
                <article className="stat-card"><span>Today's Customers</span><strong>{analytics.today.customers}</strong></article>
                <article className="stat-card"><span>Menu items</span><strong>{summary?.items ?? 0}</strong></article>
                <article className="stat-card"><span>Today's Orders</span><strong>{analytics.today.orders}</strong></article>
                <article className="stat-card"><span>Today's Revenue</span><strong>${(analytics.today.revenue).toFixed(2)}</strong></article>
              </>
            ) : (
              <>
                <article className="stat-card"><Skeleton className="title" /><Skeleton className="line" /></article>
                <article className="stat-card"><Skeleton className="title" /><Skeleton className="line" /></article>
                <article className="stat-card"><Skeleton className="title" /><Skeleton className="line" /></article>
                <article className="stat-card"><Skeleton className="title" /><Skeleton className="line" /></article>
              </>
            )}
          </div>
        )}

        <div className="admin-tab-shell">
          <div className="admin-tab-rail" role="tablist" aria-label="Admin sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`admin-tab-button ${activeTab === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-panel-stage panel panel-wide" key={activeTab}>
        {activeTab === 'analytics' && (
          <div className="admin-tab-panel">
            <div className="section-heading">
              <h3>Daily Analytics</h3>
              <p>Track revenue, orders, and customer signups by day.</p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <button type="button" className="secondary-button" onClick={() => setActiveTab('dashboard')}>Back to Dashboard</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button type="button" className={analyticsRange === 1 ? 'primary-button' : 'secondary-button'} onClick={() => setAnalyticsRange(1)}>Today</button>
              <button type="button" className={analyticsRange === 7 ? 'primary-button' : 'secondary-button'} onClick={() => setAnalyticsRange(7)}>Last 7 Days</button>
              <button type="button" className={analyticsRange === 30 ? 'primary-button' : 'secondary-button'} onClick={() => setAnalyticsRange(30)}>Last 30 Days</button>
            </div>

            <div className="stats-row">
              <article className="stat-card"><span>Today Revenue</span><strong>${(analytics?.today.revenue ?? 0).toFixed(2)}</strong></article>
              <article className="stat-card"><span>Today Orders</span><strong>{analytics?.today.orders ?? 0}</strong></article>
              <article className="stat-card"><span>Today Customers</span><strong>{analytics?.today.customers ?? 0}</strong></article>
              <article className="stat-card"><span>Menu items</span><strong>{analytics?.menuItems ?? 0}</strong></article>
            </div>

              <div className="admin-table" ref={(el) => {
                if (!el) return;
                gsap.fromTo(Array.from(el.children), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
              }}>
                {analytics?.days.map((day) => (
                  <article key={day.date} className="admin-order-row">
                    <div>
                      <strong>{formatDayLabel(day.date)}</strong>
                      <div style={{ color: 'var(--muted)', marginTop: 6 }}>Revenue: ${day.revenue.toFixed(2)}</div>
                    </div>
                    <div>
                      <span>Orders: {day.orders}</span>
                      <strong>Customers: {day.customers}</strong>
                    </div>
                  </article>
                ))}
              </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="admin-tab-panel">
            <div className="panel panel-wide">
          <div className="section-heading">
            <h3>Branding manager</h3>
            <p>Edit restaurant branding and upload images that appear on the live customer pages.</p>
          </div>

          <div className="form-grid">
            <input placeholder="Restaurant name" value={branding?.restaurantName ?? ''} onChange={(event) => setBranding((current) => current ? { ...current, restaurantName: event.target.value } : current)} />
            <input placeholder="Tagline" value={branding?.tagline ?? ''} onChange={(event) => setBranding((current) => current ? { ...current, tagline: event.target.value } : current)} />
            <input placeholder="Primary color" value={branding?.primaryColor ?? ''} onChange={(event) => setBranding((current) => current ? { ...current, primaryColor: event.target.value } : current)} />
            <input placeholder="Support email" type="email" value={branding?.supportEmail ?? ''} onChange={(event) => setBranding((current) => current ? { ...current, supportEmail: event.target.value } : current)} />
            <input placeholder="Logo URL" value={branding?.logoUrl ?? ''} onChange={(event) => setBranding((current) => current ? { ...current, logoUrl: event.target.value } : current)} />
            <input placeholder="Hero image URL" value={branding?.heroImageUrl ?? ''} onChange={(event) => setBranding((current) => current ? { ...current, heroImageUrl: event.target.value } : current)} />
            <input placeholder="Payment QR Code URL" value={branding?.paymentQrCodeUrl ?? ''} onChange={(event) => setBranding((current) => current ? { ...current, paymentQrCodeUrl: event.target.value } : current)} />
          </div>

          <div className="toggle-row">
            <label>
              Upload logo image
              <input type="file" accept="image/*" onChange={(event) => void uploadImage(event, 'logoUrl')} />
            </label>
            <label>
              Upload hero image
              <input type="file" accept="image/*" onChange={(event) => void uploadImage(event, 'heroImageUrl')} />
            </label>
            <label>
              Upload payment QR code
              <input type="file" accept="image/*" onChange={(event) => void uploadImage(event, 'paymentQrCodeUrl')} />
            </label>
          </div>

          <button type="button" className="primary-button" onClick={saveBranding}>Save branding</button>
          {statusMessage ? <div className="success-banner">{statusMessage}</div> : null}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="admin-tab-panel panel panel-wide">
          <div className="section-heading">
            <h3>Menu manager</h3>
            <p>Add, update, or remove dishes from the live menu.</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <button type="button" className="secondary-button" onClick={() => setActiveTab('dashboard')}>Back to Dashboard</button>
          </div>

          <div className="form-grid">
            <input placeholder="Item name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <input placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
            <input placeholder="Price" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} />
            <input placeholder="Image URL" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
            <textarea placeholder="Description" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </div>

          <div className="toggle-row">
            <label><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured</label>
            <label><input type="checkbox" checked={form.available} onChange={(event) => setForm({ ...form, available: event.target.checked })} /> Available</label>
          </div>

          <button type="button" className="primary-button" onClick={saveItem}>Create menu item</button>

          <div className="admin-menu-list" ref={(el) => {
            if (!el) return;
            gsap.fromTo(Array.from(el.children), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
          }}>
            {menu.length ? (
              menu.map((item) => (
                <article key={item.id} className="admin-item-card">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.category}</span>
                  </div>
                  <div className="admin-item-actions">
                    <button type="button" onClick={async () => { if (token) { await updateMenuItem(token, item.id, { available: !item.available }); await refresh(); } }}>Toggle availability</button>
                    <button type="button" onClick={async () => { if (token) { await deleteMenuItem(token, item.id); await refresh(); } }}>Delete</button>
                  </div>
                </article>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <article key={`placeholder-${i}`} className="admin-item-card">
                  <div>
                    <Skeleton width={160} height={16} />
                    <Skeleton width={80} height={12} />
                  </div>
                  <div className="admin-item-actions">
                    <Skeleton width={80} height={28} />
                    <Skeleton width={80} height={28} />
                  </div>
                </article>
              ))
            )}
          </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-tab-panel panel panel-wide">
          <div className="section-heading">
            <h3>Orders</h3>
            <p>Track all customer purchases and update delivery state.</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <button type="button" className="secondary-button" onClick={() => setActiveTab('dashboard')}>Back to Dashboard</button>
          </div>

          <div className="admin-table" ref={(el) => {
            if (!el) return;
            gsap.fromTo(Array.from(el.children), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
          }}>
            {orders.length ? (
              orders.map((order) => (
                <article key={order.id} className="admin-order-row">
                  <div>
                    <strong>{order.userName}</strong>
                    <div style={{ color: 'var(--muted)', marginTop: 6 }}>{order.items.map((item) => `${item.quantity} x ${item.name}`).join(', ')}</div>
                    {order.address && <div style={{ marginTop: 6 }}><strong>Address:</strong> {order.address}</div>}
                    {order.paymentMethod && <div style={{ marginTop: 4 }}><strong>Payment:</strong> {order.paymentMethod}{order.transactionNo ? ` — TXN: ${order.transactionNo}` : ''}</div>}
                    {order.verificationCode && <span className="verification-code">Code: {order.verificationCode}</span>}
                  </div>
                  <div>
                    <span>{order.status}</span>
                    <strong>${order.total.toFixed(2)}</strong>
                  </div>
                  <select value={order.status} onChange={async (event) => { if (token) { await updateOrderStatus(token, order.id, event.target.value as Order['status']); await refresh(); } }}>
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="preparing">preparing</option>
                    <option value="out_for_delivery">out_for_delivery</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                  {!order.verifiedAt && order.verificationCode && (
                    <div className="verify-section">
                      {verifyingOrderId === order.id ? (
                        <div className="verify-input">
                          <input
                            type="text"
                            placeholder="Enter code"
                            value={verificationCode}
                            onChange={(event) => setVerificationCode(event.target.value)}
                            maxLength={6}
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (token && verificationCode) {
                                try {
                                  await verifyOrder(token, order.id, verificationCode);
                                  setVerifyingOrderId(null);
                                  setVerificationCode('');
                                  await refresh();
                                } catch (error) {
                                  alert('Invalid verification code');
                                }
                              }
                            }}
                          >
                            Verify
                          </button>
                          <button type="button" onClick={() => { setVerifyingOrderId(null); setVerificationCode(''); }}>Cancel</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setVerifyingOrderId(order.id)}>Verify Delivery</button>
                      )}
                    </div>
                  )}
                  {order.verifiedAt && <span className="verified-badge">✓ Verified</span>}
                </article>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <article key={`order-ph-${i}`} className="admin-order-row">
                  <div>
                    <Skeleton width={140} height={16} />
                    <Skeleton width={220} height={12} />
                  </div>
                  <div>
                    <Skeleton width={60} height={16} />
                    <Skeleton width={60} height={20} />
                  </div>
                  <Skeleton width={120} height={28} />
                </article>
              ))
            )}
          </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="admin-tab-panel panel panel-wide">
            <div className="section-heading">
              <h3>Customers</h3>
              <p>All registered customers. Select a customer to view full details.</p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <button type="button" className="secondary-button" onClick={() => setActiveTab('dashboard')}>Back to Dashboard</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div className="user-list">
                  {users.map((user) => (
                    <article key={user.id} className="user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{user.name}</strong>
                        <div style={{ color: 'var(--muted)' }}>{user.email}</div>
                      </div>
                      <div>
                        <button type="button" onClick={() => setSelectedCustomer(user)}>View</button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div>
                {selectedCustomer ? (
                  <div className="panel">
                    <h4>{selectedCustomer.name}</h4>
                    <p><strong>Email:</strong> {selectedCustomer.email}</p>
                    <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                    <p><strong>Address:</strong> {selectedCustomer.address}</p>
                    <p><strong>City:</strong> {selectedCustomer.city}</p>
                    <p><strong>Pincode:</strong> {selectedCustomer.pincode}</p>
                  </div>
                ) : (
                  <div className="loading-state">Select a customer to view details</div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>

        <footer className="admin-footer panel panel-wide">
          <div className="admin-footer-top">
            <div className="admin-footer-brand">
            <div className="brand-mark">FH</div>
            <div>
              <strong>FoodiesHotel</strong>
              <span>Managed by FoodiesHotel Admin Team</span>
            </div>
          </div>

          <div className="admin-footer-details">
            <span>123 Main Street, New York, NY 10001</span>
            <span>+1 (234) 567-890</span>
            <span>{branding?.supportEmail ?? 'support@foodieshotel.com'}</span>
            <span>Managed by Arjeet Rai</span>
          </div>
          </div>

          <div className="admin-footer-bottom">
            <span className="admin-footer-visitors">Visitors: {summary?.visitors ?? 0}</span>
            <span className="admin-footer-time">{footerTime}</span>
          </div>
        </footer>
      </section>
    </Shell>
  );
}
