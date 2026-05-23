(async()=>{
  try{
    const api = 'http://localhost:4000/api';
    const loginRes = await fetch(api + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@foodieshotel.com', password: 'admin123', role: 'admin' }) });
    const login = await loginRes.json();
    if (!login.accessToken) { console.error('Login failed:', login); process.exit(2); }
    console.log('Login success. Token length:', login.accessToken.length);
    const ordersRes = await fetch(api + '/admin/orders', { headers: { Authorization: 'Bearer ' + login.accessToken } });
    const orders = await ordersRes.json();
    console.log('Fetched orders count:', (orders.orders || []).length);
    console.log(JSON.stringify((orders.orders || []).slice(0,5), null, 2));
  } catch (err) {
    console.error('Error during admin check:', err.message || err);
    process.exit(2);
  }
})();
