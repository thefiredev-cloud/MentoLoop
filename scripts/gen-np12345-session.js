(async () => {
  const fetch = global.fetch;
  const sk = process.env.STRIPE_SECRET_KEY;
  const baseUrlRaw = process.env.NEXT_PUBLIC_APP_URL || 'https://mentoloop.com';
  const baseUrl = /^https?:\/\//i.test(baseUrlRaw)
    ? baseUrlRaw
    : `https://${baseUrlRaw.replace(/^\/+|\/+$|\s+/g, '')}`;
  if (!sk) { console.error('Missing STRIPE_SECRET_KEY'); process.exit(1); }

  const headers = (idem) => ({
    'Authorization': `Bearer ${sk}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    ...(idem ? {'Idempotency-Key': idem} : {})
  });

  async function ensureCoupon(code) {
    // Try fetch existing coupon by id
    let res = await fetch(`https://api.stripe.com/v1/coupons/${encodeURIComponent(code)}`, { headers: headers() });
    if (res.ok) { return await res.json(); }
    // Create coupon 100% once
    res = await fetch('https://api.stripe.com/v1/coupons', {
      method: 'POST',
      headers: headers(`coupon_${code}`),
      body: new URLSearchParams({ id: code, percent_off: '100', duration: 'once' })
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Create coupon failed: ${res.status} ${t}`);
    }
    return await res.json();
  }

  async function ensurePromotionCode(code, couponId) {
    // Search by code
    let res = await fetch(`https://api.stripe.com/v1/promotion_codes?limit=1&code=${encodeURIComponent(code)}`, { headers: headers() });
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length) return data.data[0];
    }
    // Create promotion code
    res = await fetch('https://api.stripe.com/v1/promotion_codes', {
      method: 'POST',
      headers: headers(`promotion_${code}`),
      body: new URLSearchParams({ coupon: couponId, code })
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Create promotion failed: ${res.status} ${t}`);
    }
    return await res.json();
  }

  async function createCheckoutSession(promoId) {
    const priceId = 'price_1S77JeKVzfTBpytS1UfSG4Pl'; // Pro block LIVE
    const params = new URLSearchParams({
      mode: 'payment',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'discounts[0][promotion_code]': promoId,
      success_url: `${baseUrl}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/student-intake`,
      customer_email: `qa-np12345-${Date.now()}@sandboxmentoloop.online`,
      'metadata[membershipPlan]': 'pro',
      'metadata[studentName]': 'QA NP12345',
    });
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: headers(`np12345_qa_${Date.now()}`),
      body: params
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Create session failed: ${res.status} ${t}`);
    }
    return await res.json();
  }

  try {
    const coupon = await ensureCoupon('NP12345');
    const promo = await ensurePromotionCode('NP12345', coupon.id);
    const session = await createCheckoutSession(promo.id);
    console.log('SESSION_URL=' + session.url);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
