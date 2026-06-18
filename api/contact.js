const { MongoClient } = require('mongodb');

// Reuse connection across warm invocations
let cachedClient = null;

async function getCollection() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient.db('nexaflow').collection('leads');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { first_name, last_name, email, phone, company, message } = req.body;

  if (!first_name || !last_name || !email || !company) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const collection = await getCollection();
    await collection.insertOne({
      first_name,
      last_name,
      email,
      phone:   phone   || '',
      company,
      message: message || '',
      submitted_at: new Date(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('MongoDB error:', err);
    return res.status(500).json({ error: 'Failed to save submission' });
  }
};
