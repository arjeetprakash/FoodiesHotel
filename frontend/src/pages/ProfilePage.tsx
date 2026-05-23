import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import * as api from '../lib/api';
import type { AuthUser, Order } from '../types';

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
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!token) return;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Personal Information</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={profile?.email} disabled className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p><strong>Name:</strong> {profile?.name}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Phone:</strong> {profile?.phone || 'Not set'}</p>
            <p><strong>Address:</strong> {profile?.address || 'Not set'}</p>
            <p><strong>City:</strong> {profile?.city || 'Not set'}</p>
            <p><strong>Pincode:</strong> {profile?.pincode || 'Not set'}</p>
          </div>
        )}
      </div>

      {/* Orders History Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="border border-gray-200 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="text-sm"><strong>Items:</strong> {order.items.length} item(s)</p>
                  <p className="text-sm"><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
                  <p className="text-sm"><strong>Payment:</strong> {order.paymentMode === 'online' ? 'Online' : 'Cash'}</p>
                  {order.transactionNo && (
                    <p className="text-sm"><strong>Transaction:</strong> {order.transactionNo}</p>
                  )}
                </div>
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600 hover:underline">View items</summary>
                  <ul className="mt-2 pl-4 space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx}>{item.quantity}x {item.name} @ ₹{item.price}</li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
