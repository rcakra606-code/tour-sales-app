// controllers/userController.js
exports.getAllUsers = (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : "%%";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const total = db.prepare("SELECT COUNT(*) AS c FROM users WHERE username LIKE ? OR name LIKE ? OR email LIKE ?").get(search, search, search).c;
  const users = db.prepare(`
    SELECT username, name, email, type 
    FROM users 
    WHERE username LIKE ? OR name LIKE ? OR email LIKE ? 
    ORDER BY username ASC 
    LIMIT ? OFFSET ?
  `).all(search, search, search, limit, offset);

  res.json({
    data: users,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
};
