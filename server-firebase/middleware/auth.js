import jwt from 'jsonwebtoken';
import { findUserById } from '../db-firebase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bible-memorize-secret-change-in-production';

export function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: '未登入' });
  }
  (async () => {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await findUserById(payload.userId);
      if (!user) return res.status(401).json({ error: '使用者不存在' });
      req.user = user;
      next();
    } catch (e) {
      return res.status(401).json({ error: '登入已過期或無效' });
    }
  })();
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: '需要管理員權限' });
  }
  next();
}
