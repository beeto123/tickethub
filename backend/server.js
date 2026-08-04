const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

dotenv.config();

const app = express();

// ========== CORS CONFIGURATION ==========
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// ========== CLOUDINARY CONFIGURATION ==========
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️ Cloudinary configured with cloud:', process.env.CLOUDINARY_CLOUD_NAME);

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ========== SUPABASE CONFIGURATION ==========
const SUPABASE_URL = process.env.SUPABASE_URL || "https://izdkluwbwplutdontkmm.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "sb_publishable_BBiZeXwIxJvw73-6cHICtg_GfNNUdtq";

console.log('🔌 Connecting to Supabase...');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Your Trust Wallet USDT TRC20 address
const YOUR_WALLET = "TFj4rDL2MwisN5XfXKNLFoRie7SVwrhh6H";

// ========== IMAGE UPLOAD ==========
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'ticket-resale',
      transformation: [{ width: 600, height: 300, crop: 'fill' }]
    });

    res.json({ success: true, imageUrl: result.secure_url });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== GET ALL TICKETS ==========
app.get('/api/tickets', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('❌ Error fetching tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== GET SINGLE TICKET BY ID OR SLUG ==========
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's a numeric ID or slug
    const isNumeric = /^\d+$/.test(id);
    
    let query = supabase.from('tickets').select('*');
    
    if (isNumeric) {
      query = query.eq('id', parseInt(id));
    } else {
      query = query.eq('slug', id);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      console.error('Error fetching ticket:', error);
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ADD NEW TICKET - FIXED ==========
app.post('/api/tickets', async (req, res) => {
  try {
    const { event_name, date, location, price, image, currency, payment_link } = req.body;
    
    console.log('📝 Adding ticket:', event_name);
    
    // Insert the ticket
    const { data, error } = await supabase
      .from('tickets')
      .insert([{ 
        event_name, 
        date, 
        location, 
        price: parseFloat(price), 
        image,
        currency: currency || 'USD',
        payment_link: payment_link || '',
        is_sold: false
      }])
      .select();
    
    if (error) throw error;
    
    // Get the new ticket ID
    const ticketId = data[0].id;
    
    // Generate slug: event-name-location-id
    const slugBase = event_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const locationSlug = location
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const finalSlug = `${slugBase}-${locationSlug}-${ticketId}`;
    
    console.log('📝 Generated slug:', finalSlug);
    
    // Update the ticket with the slug
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ slug: finalSlug })
      .eq('id', ticketId);
    
    if (updateError) throw updateError;
    
    // Fetch the updated ticket
    const { data: updatedData, error: fetchError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();
    
    if (fetchError) throw fetchError;
    
    console.log('✅ Ticket added with slug:', updatedData.slug);
    res.json(updatedData);
  } catch (error) {
    console.error('❌ Error adding ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== UPDATE TICKET (Mark as Sold, etc.) ==========
app.patch('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('📝 Updating ticket:', id, updates);
    
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('❌ Error updating ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== DELETE TICKET ==========
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting ticket with ID:', id);
    
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    console.log('✅ Ticket deleted:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== PAYMENT LINK ==========
app.post('/api/pay', (req, res) => {
  const { paymentLink } = req.body;
  
  if (!paymentLink) {
    return res.status(400).json({ error: 'No payment link provided' });
  }
  
  res.json({ 
    success: true, 
    paymentLink: paymentLink
  });
});

// ========== ADMIN LOGIN ==========
const ADMIN_PASSWORD = "admin123";

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`💰 Payment endpoint: http://localhost:${PORT}/api/pay`);
});