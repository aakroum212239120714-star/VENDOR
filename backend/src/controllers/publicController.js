const pool = require('../config/db');

// GET /api/public/:slug — بيانات المتجر
const getStore = async (req, res) => {
  const { slug } = req.params;
  try {
    const [stores] = await pool.query(
      'SELECT * FROM stores WHERE slug = ?', [slug]
    );
    if (stores.length === 0) {
      return res.status(404).json({ message: 'المتجر غير موجود' });
    }
    res.json({ store: stores[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/public/:slug/products — منتجات المتجر
const getStoreProducts = async (req, res) => {
  const { slug } = req.params;
  try {
    const [stores] = await pool.query(
      'SELECT * FROM stores WHERE slug = ?', [slug]
    );
    if (stores.length === 0) {
      return res.status(404).json({ message: 'المتجر غير موجود' });
    }
    const store_id = stores[0].id;
    const [products] = await pool.query(
      'SELECT * FROM products WHERE store_id = ? ORDER BY created_at DESC',
      [store_id]
    );
    res.json({ store: stores[0], products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/public/:slug/order — طلب من عميل
const createOrder = async (req, res) => {
  const { slug } = req.params;
  const { customer_name, customer_phone, customer_address, items } = req.body;

  if (!customer_name  || !customer_phone||!items || items.length === 0) {
    return res.status(400).json({ message: 'بيانات الطلب غير مكتملة' });
  }

  try {
    const [stores] = await pool.query(
      'SELECT * FROM stores WHERE slug = ?', [slug]
    );
    if (stores.length === 0) {
      return res.status(404).json({ message: 'المتجر غير موجود' });
    }

    const store_id = stores[0].id;

    // احسب الإجمالي
    let total = 0;
    for (const item of items) {
      const [products] = await pool.query(
        'SELECT * FROM products WHERE id = ? AND store_id = ?',
        [item.product_id, store_id]
      );
      if (products.length === 0) {
        return res.status(400).json({ message: `المنتج ${item.product_id} غير موجود` });
      }
      total += products[0].price * item.quantity;
    }

    // أنشئ الطلب
    const [order] = await pool.query(
      'INSERT INTO orders (store_id, customer_name,  customer_phone, customer_address) VALUES (?, ?, ?, ?)',
      [store_id, customer_name,  customer_phone || null, customer_address || null]
    );

    const order_id = order.insertId;

    // أضف تفاصيل الطلب
    for (const item of items) {
      const [products] = await pool.query(
        'SELECT * FROM products WHERE id = ?', [item.product_id]
      );
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [order_id, item.product_id, item.quantity, products[0].price]
      );
      // قلّل المخزون
      await pool.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    res.status(201).json({ message: 'تم إرسال الطلب بنجاح ✅', order_id });

  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error('ORDER ERROR:', err);
  }
};

module.exports = { getStore, getStoreProducts, createOrder };