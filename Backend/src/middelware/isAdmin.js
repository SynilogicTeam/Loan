const isAdmin = (req, res, next) => {
  console.log("ROLE CHECK 👉", req.user?.role);

  if (
    req.user &&
    (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN")
  ) {
    return next();
  }

  return res.status(403).json({
    message: "Admin access only",
    yourRole: req.user?.role || null,
  });
};

export default isAdmin;
