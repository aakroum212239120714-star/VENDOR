const express = require("express");
const router = express.Router();

const {
  createStore,
  getMyStore,
  updateMyStore,
} = require("../controllers/storeController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// POST /api/stores       → create store (with optional logo + banner upload)
router.post(
  "/",
  protect,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createStore,
);

// GET /api/stores/mine   → get my store
router.get("/mine", protect, getMyStore);

// PUT /api/stores/mine   → update my store (with optional logo + banner upload)
router.put(
  "/mine",
  protect,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateMyStore,
);

module.exports = router;
