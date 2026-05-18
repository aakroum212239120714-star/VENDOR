const pool = require("../config/db");

const isUnknownColumnError = (err) =>
  err && (err.code === "ER_BAD_FIELD_ERROR" || err.errno === 1054);

// ─────────────────────────────────────────
// Helper: generate slug from name + user_id
// ─────────────────────────────────────────
const generateSlug = (name, user_id) => {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") +
    "-" +
    user_id
  );
};

// ─────────────────────────────────────────
// Helper: resolve uploaded file path
// Works with both upload.fields (req.files)
// and upload.single (req.file) for compat.
// ─────────────────────────────────────────
const resolveFile = (req, fieldName) => {
  // upload.fields → req.files is an object keyed by field name
  if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
    return `/uploads/${req.files[fieldName][0].filename}`;
  }
  // upload.single fallback (logo only)
  if (fieldName === "logo" && req.file) {
    return `/uploads/${req.file.filename}`;
  }
  return null;
};

// ─────────────────────────────────────────
// @desc   Create a new store
// @route  POST /api/stores
// @access Private
// ─────────────────────────────────────────
const createStore = async (req, res) => {
  const user_id = req.user.id;

  const { name, description, primary_color, card_bg, page_bg } = req.body;

  const logo = resolveFile(req, "logo");

  try {
    // 1. Validate
    if (!name) {
      return res.status(400).json({ message: "اسم المتجر مطلوب" });
    }

    // 2. Check if user already has a store
    const [existing] = await pool.query(
      "SELECT id FROM stores WHERE user_id = ?",
      [user_id],
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "لديك متجر بالفعل" });
    }

    // 3. Auto-generate slug
    const slug = generateSlug(name, user_id);

    // 4. Apply defaults for theme fields
    const finalPrimaryColor = primary_color || "#9fe870";
    const finalCardBg = card_bg || "#ffffff";
    const finalPageBg = page_bg || "#f9faf8";

    // 5. INSERT
    let result;
    try {
      [result] = await pool.query(
        `INSERT INTO stores
           (user_id, name, slug, description, logo, primary_color, card_bg, page_bg)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          name,
          slug,
          description || null,
          logo,
          finalPrimaryColor,
          finalCardBg,
          finalPageBg,
        ],
      );
    } catch (err) {
      if (!isUnknownColumnError(err)) throw err;

      // Backward compatible fallback for older schemas
      [result] = await pool.query(
        "INSERT INTO stores (user_id, name, slug, description, logo) VALUES (?, ?, ?, ?, ?)",
        [user_id, name, slug, description || null, logo],
      );
    }

    res.status(201).json({
      message: "تم إنشاء المتجر بنجاح ✅",
      store: {
        id: result.insertId,
        user_id,
        name,
        slug,
        description: description || null,
        logo,
        primary_color: finalPrimaryColor,
        card_bg: finalCardBg,
        page_bg: finalPageBg,
        corner_radius: 16,
        banner: null,
        banner_title: null,
        banner_subtitle: null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// @desc   Get my store
// @route  GET /api/stores/mine
// @access Private
// ─────────────────────────────────────────
const getMyStore = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [results] = await pool.query(
      "SELECT * FROM stores WHERE user_id = ?",
      [user_id],
    );

    if (results.length === 0) {
      return res.json({ store: null });
    }

    res.json({ store: results[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// @desc   Update my store
// @route  PUT /api/stores/mine
// @access Private
// ─────────────────────────────────────────
const updateMyStore = async (req, res) => {
  const user_id = req.user.id;

  const {
    name,
    description,
    slug,
    primary_color,
    card_bg,
    page_bg,
    corner_radius,
    banner_title,
    banner_subtitle,
  } = req.body;

  const newLogo = resolveFile(req, "logo");
  const newBanner = resolveFile(req, "banner");

  try {
    // 1. Find current store
    const [results] = await pool.query(
      "SELECT * FROM stores WHERE user_id = ?",
      [user_id],
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "لا يوجد متجر لهذا الحساب" });
    }

    const store = results[0];

    // 2. Merge old values with new — only override when a new value was provided
    const updatedName = name || store.name;
    const updatedSlug =
      slug !== undefined && slug !== ""
        ? slug
        : name
          ? generateSlug(name, user_id)
          : store.slug;
    const updatedDesc =
      description !== undefined ? description : store.description;
    const updatedLogo = newLogo || store.logo;
    const updatedBanner = newBanner || store.banner;
    const updatedPrimaryColor =
      primary_color !== undefined ? primary_color : store.primary_color;
    const updatedCardBg = card_bg !== undefined ? card_bg : store.card_bg;
    const updatedPageBg = page_bg !== undefined ? page_bg : store.page_bg;
    const updatedCornerRadius =
      corner_radius !== undefined ? corner_radius : store.corner_radius;
    const updatedBannerTitle =
      banner_title !== undefined ? banner_title : store.banner_title;
    const updatedBannerSubtitle =
      banner_subtitle !== undefined ? banner_subtitle : store.banner_subtitle;

    // 3. UPDATE
    try {
      await pool.query(
        `UPDATE stores SET
           name=?,           slug=?,              description=?,
           logo=?,           primary_color=?,     card_bg=?,
           page_bg=?,        corner_radius=?,     banner=?,
           banner_title=?,   banner_subtitle=?
         WHERE user_id=?`,
        [
          updatedName,
          updatedSlug,
          updatedDesc,
          updatedLogo,
          updatedPrimaryColor,
          updatedCardBg,
          updatedPageBg,
          updatedCornerRadius,
          updatedBanner,
          updatedBannerTitle,
          updatedBannerSubtitle,
          user_id,
        ],
      );
    } catch (err) {
      if (!isUnknownColumnError(err)) throw err;

      // Backward compatible fallback for older schemas
      await pool.query(
        "UPDATE stores SET name=?, slug=?, description=?, logo=? WHERE user_id=?",
        [updatedName, updatedSlug, updatedDesc, updatedLogo, user_id],
      );
    }

    res.json({
      message: "تم تحديث المتجر بنجاح ✅",
      store: {
        ...store,
        name: updatedName,
        slug: updatedSlug,
        description: updatedDesc,
        logo: updatedLogo,
        primary_color: updatedPrimaryColor,
        card_bg: updatedCardBg,
        page_bg: updatedPageBg,
        corner_radius: updatedCornerRadius,
        banner: updatedBanner,
        banner_title: updatedBannerTitle,
        banner_subtitle: updatedBannerSubtitle,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createStore, getMyStore, updateMyStore };
