const pool = require('../backend/src/config/db');

(async () => {
  const db = process.env.DB_NAME || 'my_platform';

  const hasColumn = async (table, column) => {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [db, table, column],
    );
    return Number(rows[0]?.c || 0) > 0;
  };

  const addIfMissing = async (table, column, sql) => {
    const exists = await hasColumn(table, column);
    if (!exists) {
      await pool.query(sql);
      console.log(`added ${table}.${column}`);
    } else {
      console.log(`exists ${table}.${column}`);
    }
  };

  try {
    // stores theme columns
    await addIfMissing('stores', 'primary_color', 'ALTER TABLE stores ADD COLUMN primary_color VARCHAR(20) NULL');
    await addIfMissing('stores', 'card_bg', 'ALTER TABLE stores ADD COLUMN card_bg VARCHAR(20) NULL');
    await addIfMissing('stores', 'page_bg', 'ALTER TABLE stores ADD COLUMN page_bg VARCHAR(20) NULL');
    await addIfMissing('stores', 'corner_radius', 'ALTER TABLE stores ADD COLUMN corner_radius INT NULL');
    await addIfMissing('stores', 'banner', 'ALTER TABLE stores ADD COLUMN banner VARCHAR(255) NULL');
    await addIfMissing('stores', 'banner_title', 'ALTER TABLE stores ADD COLUMN banner_title VARCHAR(255) NULL');
    await addIfMissing('stores', 'banner_subtitle', 'ALTER TABLE stores ADD COLUMN banner_subtitle TEXT NULL');

    // products columns
    await addIfMissing('products', 'category', 'ALTER TABLE products ADD COLUMN category VARCHAR(120) NULL');
    await addIfMissing('products', 'is_active', 'ALTER TABLE products ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1');

    // Backfill defaults
    await pool.query(
      "UPDATE stores SET primary_color=COALESCE(primary_color,'#9fe870'), card_bg=COALESCE(card_bg,'#ffffff'), page_bg=COALESCE(page_bg,'#f9faf8'), corner_radius=COALESCE(corner_radius,16)",
    );

    const [storeCols] = await pool.query('SHOW COLUMNS FROM stores');
    const [productCols] = await pool.query('SHOW COLUMNS FROM products');

    console.log('stores columns:', storeCols.map((c) => c.Field).join(','));
    console.log('products columns:', productCols.map((c) => c.Field).join(','));
    console.log('Schema patch complete ✅');
    process.exit(0);
  } catch (err) {
    console.error('Schema patch failed ❌', err.message);
    process.exit(1);
  }
})();
