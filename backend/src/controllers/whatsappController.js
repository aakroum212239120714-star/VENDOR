const pool = require("../config/db");
const { handleIncomingMessage } = require("../services/whatsappService");

const getStore = async (user_id) => {
  const [stores] = await pool.query(
    "SELECT id, wa_token, wa_phone_id FROM stores WHERE user_id = ?",
    [user_id]
  );
  return stores[0] || null;
};

const getSettings = async (req, res) => {
  try {
    const store = await getStore(req.user.id);
    if (!store) return res.status(404).json({ message: "Store not found" });

    res.json({
      wa_phone_id: store.wa_phone_id || "",
      has_token:   !!store.wa_token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const saveSettings = async (req, res) => {
  try {
    const store = await getStore(req.user.id);
    if (!store) return res.status(404).json({ message: "Store not found" });

    const { wa_token, wa_phone_id } = req.body;
    if (!wa_token || !wa_phone_id) {
      return res.status(400).json({ message: "Token and Phone ID are required" });
    }

    await pool.query(
      "UPDATE stores SET wa_token = ?, wa_phone_id = ? WHERE id = ?",
      [wa_token, wa_phone_id, store.id]
    );

    res.json({ message: "Settings saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyWebhook = (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log("✅ Webhook verified by Meta");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

const handleWebhook = async (req, res) => {
  res.sendStatus(200);

  try {
    const body = req.body;
    if (body.object !== "whatsapp_business_account") return;

    const change  = body.entry?.[0]?.changes?.[0]?.value;
    const message = change?.messages?.[0];
    if (!message || message.type !== "text") return;

    const phoneId       = change.metadata.phone_number_id;
    const customerPhone = message.from;
    const text          = message.text.body;

    const [stores] = await pool.query(
      "SELECT id, wa_token, wa_phone_id FROM stores WHERE wa_phone_id = ?",
      [phoneId]
    );
    if (!stores.length) return;

    await handleIncomingMessage(stores[0], customerPhone, text);

  } catch (err) {
    console.error("Webhook error:", err);
  }
};

module.exports = {
  getSettings,
  saveSettings,
  verifyWebhook,
  handleWebhook,
};