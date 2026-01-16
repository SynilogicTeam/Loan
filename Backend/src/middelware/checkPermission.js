// Middleware to check if admin has specific permission
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Super Admin has all permissions
      if (req.user.role === "SUPER_ADMIN") {
        return next();
      }

      // Check if admin has the required permission
      if (!req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          message: `Access denied. Required permission: ${requiredPermission}`,
          userPermissions: req.user.permissions || [],
          requiredPermission
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

export default checkPermission;