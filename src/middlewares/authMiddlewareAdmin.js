import jwt from "jsonwebtoken";

const authMiddlewareAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  jwt.verify(token, process.env.JWT_SECRET_ADMIN, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Acesso restrito ao administrador" });
    }

    req.user = user;
    next();
  });
};

export default authMiddlewareAdmin;
