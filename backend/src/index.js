const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;

// Routes
const authRoutes     = require('./routes/authRoutes');
const storeRoutes    = require('./routes/storeRoutes');
const productRoutes  = require('./routes/productRoutes');
const publicRoutes   = require('./routes/publicRoutes');
const orderRoutes    = require('./routes/orderRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');

// Middleware
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/stores',    storeRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/public',    publicRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/whatsapp',  whatsappRoutes);

// Start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});