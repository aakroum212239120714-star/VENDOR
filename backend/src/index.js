const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes     = require('./routes/authRoutes');
const storeRoutes    = require('./routes/storeRoutes');
const productRoutes  = require('./routes/productRoutes');
const publicRoutes   = require('./routes/publicRoutes');
const orderRoutes    = require('./routes/orderRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');

app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://vendor-beta-livid.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/stores',    storeRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/public',    publicRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/whatsapp',  whatsappRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});