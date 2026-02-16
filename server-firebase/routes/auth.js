import { Router } from 'express';
import { findUserByName, findUserByNumber, verifyPassword, createUser } from '../db-firebase.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, password, role } = req.body || {};
    if (!name?.trim() || !password) {
      return res.status(400).json({ error: '請輸入名字與密碼' });
    }
    if (!role || !['teacher', 'parent', 'student'].includes(role)) {
      return res.status(400).json({ error: '請選擇角色：teacher（老師/家長）或 student（學生）' });
    }
    const existing = await findUserByName(name.trim());
    if (existing) {
      return res.status(400).json({ error: '此名字已被使用' });
    }
    const user = await createUser(name.trim(), password, role);
    const token = signToken(user);
    res.json({
      user: { id: user.id, number: user.number, name: user.name, role: user.role },
      token,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '註冊失敗' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { name, number, password } = req.body || {};
    if (!password) return res.status(400).json({ error: '請輸入密碼' });
    const user = (number && await findUserByNumber(String(number).trim())) || (name && await findUserByName(String(name).trim()));
    if (!user || !verifyPassword(user, password)) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }
    const token = signToken(user);
    res.json({
      user: { id: user.id, number: user.number, name: user.name, role: user.role },
      token,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '登入失敗' });
  }
});

export { router as authRouter };
