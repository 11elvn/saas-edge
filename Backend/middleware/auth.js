const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // 1. جلب الهيدر بالكامل
    const authHeader = req.header("Authorization");

    // 2. التحقق من وجود الهيدر وبدئه بكلمة Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied ❌" });
    }

    // 3. استخراج التوكن فقط (حذف كلمة Bearer والفراغ)
    const token = authHeader.split(" ")[1];

    // 4. استخدام المتغير البيئي من Render بدلاً من النص الثابت
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    // 5. إرسال الرد بصيغة JSON لمنع خطأ SyntaxError في المتصفح
    res.status(401).json({ message: "Invalid token ❌" });
  }
};

module.exports = auth;