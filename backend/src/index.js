const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ✅ 1. عرّف app أولاً
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ 2. استورد كل الـ Routes
const authRoutes    = require('./routes/authRoutes');
const storeRoutes   = require('./routes/storeRoutes');
const productRoutes = require('./routes/productRoutes');
const publicRoutes = require('./routes/publicRoutes');
const orderRoutes = require('./routes/orderRoutes');


// ✅ 3. Middleware
// Allow both frontend ports for development
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ 4. Routes
app.use('/api/auth',     authRoutes);
app.use('/api/stores',   storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/orders', orderRoutes);

// ✅ 5. Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});