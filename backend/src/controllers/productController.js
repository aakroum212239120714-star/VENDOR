const pool = require("../config/db");

const isUnknownColumnError = (err) =>
  err && (err.code === "ER_BAD_FIELD_ERROR" || err.errno === 1054);

// POST /api/products
const createProduct = async (req, res) => {
  const user_id = req.user.id;
  const { name, description, price, stock, category, is_active } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !price) {
    return res.status(400).json({ message: "اسم المنتج والسعر مطلوبان" });
  }

  try {
    // تحقق أن البائع لديه متجر
    const [stores] = await pool.query(
      "SELECT id FROM stores WHERE user_id = ?",
      [user_id],
    );
    if (stores.length === 0) {
      return res.status(400).json({ message: "أنشئ متجرك أولاً" });
    }

    const store_id = stores[0].id;

    let result;
    try {
      [result] = await pool.query(
        "INSERT INTO products (store_id, name, description, price, stock, image, category, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          store_id,
          name,
          description || null,
          price,
          stock || 0,
          image,
          category || null,
          is_active !== undefined ? Number(is_active) : 1,
        ],
      );
    } catch (err) {
      if (!isUnknownColumnError(err)) throw err;

      // Backward-compatible fallback for older schemas
      [result] = await pool.query(
        "INSERT INTO products (store_id, name, description, price, stock, image) VALUES (?, ?, ?, ?, ?, ?)",
        [store_id, name, description || null, price, stock || 0, image],
      );
    }

    res.status(201).json({
      message: "تم إضافة المنتج بنجاح ✅",
      product: {
        id: result.insertId,
        store_id,
        name,
        description,
        price,
        stock: stock || 0,
        image,
        category: category || null,
        is_active: is_active !== undefined ? Number(is_active) : 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/mine
const getMyProducts = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [stores] = await pool.query(
      "SELECT id FROM stores WHERE user_id = ?",
      [user_id],
    );
    if (stores.length === 0) {
      return res.json({ products: [] });
    }

    const store_id = stores[0].id;

    const [products] = await pool.query(
      "SELECT * FROM products WHERE store_id = ? ORDER BY created_at DESC",
      [store_id],
    );

    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;
  const { name, description, price, stock, category, is_active } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // تحقق أن المنتج يخص هذا البائع
    const [products] = await pool.query(
      `SELECT p.* FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.id = ? AND s.user_id = ?`,
      [id, user_id],
    );
    if (products.length === 0) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    const product = products[0];
    const updatedName = name || product.name;
    const updatedDesc =
      description !== undefined ? description : product.description;
    const updatedPrice = price || product.price;
    const updatedStock = stock !== undefined ? stock : product.stock;
    const updatedImage = image || product.image;
    const updatedCategory =
      category !== undefined ? category : product.category;
    const updatedActive =
      is_active !== undefined ? Number(is_active) : (product.is_active ?? 1);

    try {
      await pool.query(
        "UPDATE products SET name=?, description=?, price=?, stock=?, image=?, category=?, is_active=? WHERE id=?",
        [
          updatedName,
          updatedDesc,
          updatedPrice,
          updatedStock,
          updatedImage,
          updatedCategory,
          updatedActive,
          id,
        ],
      );
    } catch (err) {
      if (!isUnknownColumnError(err)) throw err;

      // Backward-compatible fallback for older schemas
      await pool.query(
        "UPDATE products SET name=?, description=?, price=?, stock=?, image=? WHERE id=?",
        [
          updatedName,
          updatedDesc,
          updatedPrice,
          updatedStock,
          updatedImage,
          id,
        ],
      );
    }

    res.json({
      message: "تم تحديث المنتج ✅",
      product: {
        ...product,
        name: updatedName,
        description: updatedDesc,
        price: updatedPrice,
        stock: updatedStock,
        image: updatedImage,
        category: updatedCategory,
        is_active: updatedActive,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  try {
    const [products] = await pool.query(
      `SELECT p.id FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.id = ? AND s.user_id = ?`,
      [id, user_id],
    );
    if (products.length === 0) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    await pool.query("DELETE FROM products WHERE id = ?", [id]);

    res.json({ message: "تم حذف المنتج ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createProduct, getMyProducts, updateProduct, deleteProduct };
