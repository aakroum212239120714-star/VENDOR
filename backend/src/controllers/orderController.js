const pool = require("../config/db");

// GET /api/orders/mine
const getMyOrders = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [stores] = await pool.query(
      "SELECT id FROM stores WHERE user_id = ?",
      [user_id],
    );
    if (stores.length === 0) {
      return res.json({ orders: [] });
    }

    const store_id = stores[0].id;

    const [orders] = await pool.query(
      `SELECT o.*,
        GROUP_CONCAT(
          JSON_OBJECT(
            'product_id', oi.product_id,
            'name', p.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.store_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [store_id],
    );

    const parsed = orders.map((o) => ({
      ...o,
      items: o.items ? JSON.parse(`[${o.items}]`) : [],
    }));

    res.json({ orders: parsed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "حالة غير صالحة" });
  }

  try {
    const [stores] = await pool.query(
      "SELECT id FROM stores WHERE user_id = ?",
      [user_id],
    );
    if (stores.length === 0) {
      return res.status(404).json({ message: "لا يوجد متجر" });
    }

    const store_id = stores[0].id;

    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE id = ? AND store_id = ?",
      [id, store_id],
    );
    if (orders.length === 0) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

    res.json({ message: "تم تحديث حالة الطلب ✅", status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyOrders, updateOrderStatus };
