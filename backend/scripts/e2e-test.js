(async function(){
  try{
    const api = 'http://localhost:4000/api';
    const fetchJson = async (url, opts={})=>{
      if(opts.body && typeof opts.body === 'object') opts.body = JSON.stringify(opts.body);
      opts.headers = opts.headers || {};
      if(opts.body) opts.headers['Content-Type'] = 'application/json';
      const res = await fetch(url, opts);
      const text = await res.text();
      try { return JSON.parse(text); } catch(e){ return text; }
    };

    console.log('Logging in as customer...');
    const custLogin = await fetchJson(api + '/auth/login', { method: 'POST', body: { email: 'customer@foodieshotel.com', password: 'customer123', role: 'customer' }});
    const customerToken = custLogin.accessToken;
    console.log('Customer token obtained');

    console.log('Fetching menu...');
    const menu = await fetchJson(api + '/menu');
    const itemId = menu.items[0].id;
    console.log('Selected menu item', itemId);

    console.log('Placing order...');
    const placed = await fetchJson(api + '/orders', { method: 'POST', body: { items: [{ menuItemId: itemId, quantity: 1 }], address: '456 Oak Avenue', paymentMethod: 'Cash' }, headers: { Authorization: 'Bearer ' + customerToken }});
    const order = placed.order;
    console.log('Order placed:', order.id, 'code:', order.verificationCode);

    console.log('Logging in as admin...');
    const adminLogin = await fetchJson(api + '/auth/login', { method: 'POST', body: { email: 'admin@foodieshotel.com', password: 'admin123', role: 'admin' }});
    const adminToken = adminLogin.accessToken;
    console.log('Admin token obtained');

    console.log('Confirming order (status=confirmed)...');
    await fetchJson(api + '/orders/' + order.id + '/status', { method: 'PATCH', body: { status: 'confirmed' }, headers: { Authorization: 'Bearer ' + adminToken }});
    console.log('Order confirmed');

    console.log('Fetching admin orders to check verificationCodeSentAt...');
    const adminOrders = await fetchJson(api + '/admin/orders', { headers: { Authorization: 'Bearer ' + adminToken }});
    const found = adminOrders.orders.find(o=>o.id===order.id);
    console.log('verificationCodeSentAt:', found.verificationCodeSentAt);

    console.log('Verifying delivery using code...');
    const verifyRes = await fetchJson(api + '/orders/' + order.id + '/verify', { method: 'PUT', body: { verificationCode: order.verificationCode }, headers: { Authorization: 'Bearer ' + adminToken }});
    console.log('verifiedAt:', verifyRes.order.verifiedAt);

    console.log('E2E test completed successfully');
  }catch(err){
    console.error('E2E test failed', err);
    process.exitCode = 2;
  }
})();
