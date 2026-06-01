
const pool  = require("../config/db");
const { generateAIResponse } = require("./geminiService");

const sendMessage = async (wa_token, wa_phone_id, to, text) => {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${wa_phone_id}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${wa_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Meta API Error: ${JSON.stringify(err)}`);
  }

  return res.json();
};

const getHistory = async (phone, store_id) => {
  const [rows] = await pool.query(
    "SELECT context_json FROM conversation_history WHERE phone_number = ? AND store_id = ?",
    [phone, store_id]
  );
  return rows.length > 0 ? rows[0].context_json : [];
};

const saveHistory = async (phone, store_id, history) => {
  const trimmed = history.length > 10 ? history.slice(-10) : history;
  await pool.query(
    `INSERT INTO conversation_history (phone_number, store_id, context_json)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE context_json = ?`,
    [phone, store_id, JSON.stringify(trimmed), JSON.stringify(trimmed)]
  );
};

const createOrder = async (store_id, customerPhone, orderDetails) => {
  const { customer_name, wilaya, phone, items } = orderDetails;

  const [result] = await pool.query(
    `INSERT INTO orders (store_id, customer_name, customer_phone, customer_wilaya, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [store_id, customer_name, phone || customerPhone, wilaya]
  );
  const order_id = result.insertId;

  for (const item of items) {
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)`,
      [order_id, item.product_id, item.quantity]
    );
    await pool.query(
      `UPDATE products SET stock = stock - ? WHERE id = ? AND store_id = ?`,
      [item.quantity, item.product_id, store_id]
    );
  }

  console.log(`✅ Order #${order_id} created for store ${store_id}`);
  return order_id;
};

const handleIncomingMessage = async (store, customerPhone, text) => {
  const store_id = store.id;

  try {
    const [products] = await pool.query(
      `SELECT id, name, price, stock FROM products WHERE store_id = ? AND is_active = 1`,
      [store_id]
    );

    const history = await getHistory(customerPhone, store_id);

    const aiResponse = await generateAIResponse(text, history, products);

    history.push({ role: "user",  content: text });
    history.push({ role: "model", content: aiResponse.reply_message });
    await saveHistory(customerPhone, store_id, history);

    await sendMessage(
      store.wa_token,
      store.wa_phone_id,
      customerPhone,
      aiResponse.reply_message
    );

    if (aiResponse.is_ready_to_order && aiResponse.order_details) {
      await createOrder(store_id, customerPhone, aiResponse.order_details);
      await pool.query(
        `DELETE FROM conversation_history WHERE phone_number = ? AND store_id = ?`,
        [customerPhone, store_id]
      );
    }

  } catch (err) {
    console.error(`❌ Error handling message for store ${store_id}:`, err);
    await sendMessage(
      store.wa_token,
      store.wa_phone_id,
      customerPhone,
      "عذرا، كاين مشكل صغير. راني نولي ليك من بعد 🛠️"
    ).catch(console.error);
  }
};

module.exports = {
  sendMessage,
  handleIncomingMessage,
};