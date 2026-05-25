import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { Shell } from '../components/Shell';
import { useAuth } from '../lib/auth';
import * as api from '../lib/api';
import type { AuthUser, Order } from '../types';
import Skeleton from '../components/Skeleton';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    void loadProfile();
  }, [token]);

  const loadProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError('');
      const result = await api.fetchProfile(token);
      setProfile(result.user);
      setOrders(result.orders);
      setFormData({
        name: result.user.name,
        phone: result.user.phone ?? '',
        address: result.user.address ?? '',
        city: result.user.city ?? '',
        pincode: result.user.pincode ?? ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;
    try {
      setError('');
      setSuccess('');
      const result = await api.updateProfile(token, formData);
      setProfile(result.user);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Shell title="My Profile" subtitle="Loading your details...">
        <div className="profile-layout">
          <article className="panel profile-hero">
            <div className="section-heading">
              <h3>Personal Information</h3>
              <p>Keep your delivery details current so orders arrive without delays.</p>
            </div>

            <div className="profile-summary-grid">
              <div className="profile-summary-card"><Skeleton width={180} height={18} /><Skeleton width={120} height={12} /></div>
              <div className="profile-summary-card"><Skeleton width={180} height={18} /><Skeleton width={120} height={12} /></div>
              <div className="profile-summary-card"><Skeleton width={180} height={18} /><Skeleton width={120} height={12} /></div>
              <div className="profile-summary-card"><Skeleton width={180} height={18} /><Skeleton width={120} height={12} /></div>
            </div>
          </article>

          <article className="panel profile-orders">
            <div className="section-heading">
              <h3>Order History</h3>
              <p>Review the latest orders and open any item list for details.</p>
            </div>
            <div className="order-list">
              {Array.from({ length: 2 }).map((_, i) => (
                <article key={i} className="profile-order-card">
                  <div className="profile-order-head">
                    <div>
                      <Skeleton width={140} height={18} />
                      <Skeleton width={100} height={12} />
                    </div>
                    <Skeleton width={80} height={20} />
                  </div>
                  <div className="profile-order-meta" style={{ marginTop: 14 }}>
                    <Skeleton width={120} height={12} />
                    <Skeleton width={120} height={12} />
                    <Skeleton width={120} height={12} />
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="My Profile" subtitle="Update your contact details and review order history.">
      <section className="profile-layout">
        <article className="panel profile-hero">
          <div className="section-heading">
            <h3>Personal Information</h3>
            <p>Keep your delivery details current so orders arrive without delays.</p>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}
          {success ? <div className="success-banner">{success}</div> : null}

          <div className="profile-summary-grid">
            <div className="profile-summary-card">
              <span>Name</span>
              <strong>{profile?.name || 'Not set'}</strong>
            </div>
            <div className="profile-summary-card">
              <span>Email</span>
              <strong>{profile?.email || 'Not set'}</strong>
            </div>
            <div className="profile-summary-card">
              <span>Phone</span>
              <strong>{profile?.phone || 'Not set'}</strong>
            </div>
            <div className="profile-summary-card">
              <span>City</span>
              <strong>{profile?.city || 'Not set'}</strong>
            </div>
          </div>

          {editing ? (
            <div className="profile-edit-grid">
              <label>
                Name
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
              </label>
              <label>
                Email
                <input type="email" value={profile?.email || ''} disabled />
              </label>
              <label>
                Phone
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              </label>
              <label>
                Address
                <input type="text" name="address" value={formData.address} onChange={handleChange} />
              </label>
              <label>
                City
                <input type="text" name="city" value={formData.city} onChange={handleChange} />
              </label>
              <label>
                Pincode
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} />
              </label>

              <div className="profile-edit-actions">
                <button type="button" className="primary-button" onClick={handleSave}>Save Changes</button>
                <button type="button" className="secondary-button" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="profile-edit-grid">
              <div className="profile-summary-card">
                <span>Address</span>
                <strong>{profile?.address || 'Not set'}</strong>
              </div>
              <div className="profile-summary-card">
                <span>Pincode</span>
                <strong>{profile?.pincode || 'Not set'}</strong>
              </div>

              <div className="profile-edit-actions">
                <button type="button" className="primary-button" onClick={() => setEditing(true)}>
                  Edit profile
                </button>
              </div>
            </div>
          )}
        </article>

        <article className="panel profile-orders">
          <div className="section-heading">
            <h3>Order History</h3>
            <p>Review the latest orders and open any item list for details.</p>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state">No orders yet.</div>
          ) : (
            <div ref={(el) => {
              if (!el) return;
              gsap.fromTo(Array.from(el.children), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 95%' } });
            }}>
              {orders.map((order) => (
                <article key={order.id} className="profile-order-card">
                  <div className="profile-order-head">
                    <div>
                      <strong>Order #{order.id.slice(0, 8)}</strong>
                      <div style={{ color: 'var(--muted)', marginTop: 4 }}>{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <span className="profile-order-status">{order.status.replace('_', ' ').toUpperCase()}</span>
                  </div>

                  <div className="profile-order-meta" style={{ marginTop: 14 }}>
                    <span><strong>Items:</strong> {order.items.length} item(s)</span>
                    <span><strong>Total:</strong> ₹{order.total.toFixed(2)}</span>
                    <span><strong>Payment:</strong> {order.paymentMode === 'online' ? 'Online' : 'Cash'}</span>
                  </div>

                  {order.transactionNo ? <div style={{ marginTop: 10, color: 'var(--muted)' }}><strong>Transaction:</strong> {order.transactionNo}</div> : null}

                  <details style={{ marginTop: 12 }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--brand-dark)' }}>View items</summary>
                    <ul style={{ marginTop: 10, paddingLeft: 18, color: 'var(--muted)' }}>
                      {order.items.map((item, index) => (
                        <li key={`${order.id}-${index}`}>{item.quantity}x {item.name} @ ₹{item.price}</li>
                      ))}
                    </ul>
                  </details>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </Shell>
  );
}
