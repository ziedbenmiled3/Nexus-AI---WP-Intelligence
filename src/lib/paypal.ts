import axios from 'axios';

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials missing in .env');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const url = mode === 'live' 
    ? 'https://api-m.paypal.com/v1/oauth2/token' 
    : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

  const response = await axios.post(url, 'grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return response.data.access_token;
}

export async function createBatchPayout(items: { email: string, amount: number, note?: string }[]) {
  const token = await getPayPalAccessToken();
  const mode = process.env.PAYPAL_MODE || 'sandbox';
  const url = mode === 'live' 
    ? 'https://api-m.paypal.com/v1/payments/payouts' 
    : 'https://api-m.sandbox.paypal.com/v1/payments/payouts';

  const sender_batch_id = `NexusBatch_${Date.now()}`;

  const payload = {
    sender_batch_header: {
      sender_batch_id: sender_batch_id,
      email_subject: "Vous avez reçu votre commission Nexus AI !",
      email_message: "Félicitations ! Votre commission a été versée sur votre compte PayPal."
    },
    items: items.map((item, index) => ({
      recipient_type: "EMAIL",
      amount: {
        value: item.amount.toFixed(2),
        currency: "EUR"
      },
      note: item.note || "Commission Nexus AI",
      receiver: item.email,
      sender_item_id: `Item_${index}_${Date.now()}`
    }))
  };

  const response = await axios.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}
