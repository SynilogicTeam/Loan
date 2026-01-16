import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },               // 🔥 ROLE MUST BE INSIDE TOKEN
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export default generateToken;
