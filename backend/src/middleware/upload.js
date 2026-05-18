const multer = require("multer");
const path = require("path");

// ─────────────────────────────────────────
// WHERE to save + WHAT name to give
// ─────────────────────────────────────────
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },

});

// ─────────────────────────────────────────
// FILTER: images only
// ─────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);   // ✅ accept
  } else {
    cb(new Error("فقط صور JPG / PNG / WEBP مسموح بها"), false); // ❌ reject
  }
};

// ─────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

module.exports = upload;
