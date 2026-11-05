/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to specified roles (Admin, Accountant, Staff)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource. Required roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { authorize };

