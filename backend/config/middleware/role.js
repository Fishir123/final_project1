function authorizeRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User belum terautentikasi',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Role tidak diizinkan',
      });
    }

    next();
  };
}

module.exports = authorizeRole;
