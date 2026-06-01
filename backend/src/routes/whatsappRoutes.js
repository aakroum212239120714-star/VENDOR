const express = require("express");
const { getSettings, saveSettings, verifyWebhook, handleWebhook } = require("../controllers/whatsappController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// إعدادات التاجر (محمية)
router.get("/settings",  protect, getSettings);
router.post("/settings", protect, saveSettings);

// Webhook من Meta (بدون حماية)
router.get("/webhook",  verifyWebhook);
router.post("/webhook", handleWebhook);

module.exports = router;

