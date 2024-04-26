import HttpErrors from "http-errors";
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw HttpErrors(401, 'Unauthorized: No token provided')
    }

    const { userId } = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.userId = userId;
    next();
  } catch (e) {
    e.status = 401;
    next(e);
  }
}

export default authMiddleware;
