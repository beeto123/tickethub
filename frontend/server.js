const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const YOUR_WALLET = "TFj4rDL2MwisN5XfXKNLFoRie7SVwrhh6H";

// Tickets (in memory for now - later Supabase)
let tickets = [
  {
    id: 1,
    eventName: "Wrexham AFC vs Leeds United",
    date: "Sat, July 25 2026",
    location: "Raymond James Stadium, Tampa, FL",
    price: 89,
    image: "https://picsum.photos/id/1015/600/300"
  }
];

// Get tickets
app.get('/api/tickets', (req, res) => res.json(tickets));

// Create ticket (Admin)
app.post('/api/tickets', (req, res) => {
  const newTicket = { id: Date.now(), ...req.body };
  tickets.push(newTicket);
  res.json(newTicket);
});

// Delete ticket
app.delete('/api/tickets/:id', (req, res) => {
  tickets = tickets.filter(t => t.id !== parseInt(req.params.id));
  res.json({ success: true });
});

// Payment Link
app.post('/api/pay', (req, res) => {
  const { amount } = req.body;
  // Mercuryo simple redirect link
  const paymentLink = `https://mercuryo.io/buy?amount=${amount}&currency=USD&crypto=USDT&network=TRC20&address=${YOUR_WALLET}`;
  res.json({ paymentLink });
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));