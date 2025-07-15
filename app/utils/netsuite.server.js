import fetch from 'node-fetch';
import dotenv from 'dotenv';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

dotenv.config();

function getOAuth() {
  return new OAuth({
    consumer: {
      key: process.env.NETSUITE_CONSUMER_KEY,
      secret: process.env.NETSUITE_CONSUMER_SECRET,
    },
    signature_method: 'HMAC-SHA256',
    hash_function(base_string, key) {
      return crypto
        .createHmac('sha256', key)
        .update(base_string)
        .digest('base64');
    },
  });
}

export async function fetchNetSuiteCustomers() {
  const ACCOUNT_ID = process.env.NETSUITE_ACCOUNT_ID; // "4922061_SB1"
  const REALM = process.env.NETSUITE_REALM; // "4922061_SB1"

  const URL = `https://${ACCOUNT_ID.toLowerCase().replace('_', '-')}.suitetalk.api.netsuite.com/services/rest/record/v1/inventoryItem`;

  const oauth = getOAuth();

  const request_data = {
    url: URL,
    method: 'GET',
  };

  const token = {
    key: process.env.NETSUITE_TOKEN_ID,
    secret: process.env.NETSUITE_TOKEN_SECRET,
  };

  // Generate standard OAuth header
  const oauthHeader = oauth.toHeader(oauth.authorize(request_data, token));

  // Manually add realm in Authorization header (as Postman did)
  oauthHeader['Authorization'] = `OAuth realm="${REALM}", ${oauthHeader['Authorization'].substring(6)}`;

  const headers = {
    ...oauthHeader,
    'Content-Type': 'application/json',
  };

  console.log('🔍 HEADERS:', headers);

  try {
    const response = await fetch(URL, {
      method: 'GET',
      headers: headers,
    });

    const listData = await response.json();

    if (!response.ok) {
      console.error(`❌ Netsuite Error: ${response.status} ${response.statusText}`);
      console.error(text);
      throw new Error(`❌ Netsuite Error: ${response.status} ${response.statusText} - ${text}`);
    }
    const productItems = await listData.items.slice(0, 2)
    const detailedCustomers = [];
  for (const item of productItems) {
    const id = item.id;
   
    const detailResponse = await fetch(`${URL}/${id}`, { headers });

    console.log("ID:",id)
     console.log(`${URL}/${id}`)
    const detailData = await detailResponse.json();
    detailedCustomers.push(detailData);
  }
    // console.log('✅ Netsuite Response:', text);
    console.log('✅ Netsuite Response:', detailedCustomers[0]);
    return detailedCustomers;
  } catch (error) {
    console.error('❌ Netsuite Fetch Error:', error);
    throw error;
  }
}

// Direct test call

