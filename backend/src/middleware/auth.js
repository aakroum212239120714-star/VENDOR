const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const protect = async (req, res, next) => {

  // 1. Check if token exists in the header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "غير مصرح، يرجى تسجيل الدخول" });
  }

  // 2. Extract token
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find user in DB
    const [users] = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "المستخدم غير موجود" });
    }

    // 5. Attach user to request
    req.user = users[0];

    // 6. Move to next function
    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "انتهت صلاحية التوكن، يرجى تسجيل الدخول مجدداً" });
    }
    return res.status(401).json({ message: "توكن غير صالح" });
  }
};

module.exports = { protect };
