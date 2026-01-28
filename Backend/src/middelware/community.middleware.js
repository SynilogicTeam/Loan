const restrictToCommunity = (req, res, next) => {
  // SUPER ADMIN can access everything
  if (req.user.role === "SUPER_ADMIN") {
    return next();
  }

  // Others must have communityId
  if (!req.user.communityId) {
    return res.status(403).json({
      message: "Community access required",
    });
  }

  // Attach communityId to request
  req.communityId = req.user.communityId;

  next();
};

export default restrictToCommunity;
