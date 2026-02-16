import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 支持 Electron 環境變量指定的數據目錄
const baseDataDir = process.env.USER_DATA_DIR || path.join(__dirname, '..');
const dataDir = path.join(baseDataDir, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'app.db');

let db;

function persist() {
  if (db) fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const hasRow = stmt.step();
  const row = hasRow ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    points INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS recordings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, date)
  );
  CREATE INDEX IF NOT EXISTS idx_recordings_user ON recordings(user_id);
  CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, date);
  CREATE TABLE IF NOT EXISTS scripture_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    week INTEGER NOT NULL,
    day1_text TEXT NOT NULL DEFAULT '',
    day2_text TEXT NOT NULL DEFAULT '',
    day3_text TEXT NOT NULL DEFAULT '',
    day4_text TEXT NOT NULL DEFAULT '',
    day5_text TEXT NOT NULL DEFAULT '',
    day6_text TEXT NOT NULL DEFAULT '',
    day7_text TEXT NOT NULL DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(year, week)
  );
  CREATE TABLE IF NOT EXISTS approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    approver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, date)
  );
  CREATE INDEX IF NOT EXISTS idx_approvals_student_date ON approvals(student_id, date);
  CREATE TABLE IF NOT EXISTS points_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL,
    reason TEXT NOT NULL,
    adjusted_by INTEGER REFERENCES users(id),
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_points_history_student ON points_history(student_id);
  CREATE INDEX IF NOT EXISTS idx_points_history_date ON points_history(date);
`;

export async function initDb() {
  const SQL = await initSqlJs();
  const data = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : null;
  db = new SQL.Database(data);
  db.run('PRAGMA foreign_keys = ON');
  db.exec(schema);
  // 添加 points 字段到現有的 users 表（如果不存在）
  try {
    db.run('ALTER TABLE users ADD COLUMN points INTEGER NOT NULL DEFAULT 0');
    persist();
  } catch (e) {
    // 字段已存在，忽略錯誤
  }
  persist();
}

function getNextNumber() {
  const row = get("SELECT COALESCE(MAX(CAST(number AS INTEGER)), 999) + 1 AS next FROM users WHERE number GLOB '[0-9]*'");
  return String(row.next);
}

export function createUser(name, password, role = 'user') {
  const number = getNextNumber();
  const passwordHash = bcrypt.hashSync(password, 10);
  run('INSERT INTO users (number, name, password_hash, role) VALUES (?, ?, ?, ?)', [number, name, passwordHash, role]);
  const id = get('SELECT last_insert_rowid() AS id').id;
  return { id, number, name, role };
}

export function findUserByName(name) {
  return get('SELECT id, number, name, password_hash, role FROM users WHERE name = ?', [name]);
}

export function findUserByNumber(number) {
  return get('SELECT id, number, name, password_hash, role FROM users WHERE number = ?', [number]);
}

export function findUserById(id) {
  return get('SELECT id, number, name, role, points, created_at FROM users WHERE id = ?', [id]);
}

export function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

export function listUsers() {
  return all('SELECT id, number, name, role, points, created_at FROM users ORDER BY id');
}

export function getRecordingsByUserId(userId) {
  return all('SELECT filename FROM recordings WHERE user_id = ?', [userId]);
}

export function deleteUser(id) {
  run('DELETE FROM users WHERE id = ?', [id]);
}

export function createRecording(userId, filename) {
  run('INSERT INTO recordings (user_id, filename) VALUES (?, ?)', [userId, filename]);
  const row = get('SELECT last_insert_rowid() AS id');
  return row ? row.id : null;
}

export function getRecordingsByUser(userId) {
  return all('SELECT id, filename, created_at FROM recordings WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

export function getAllRecordings() {
  return all(`
    SELECT r.id, r.filename, r.created_at, u.id AS user_id, u.number, u.name
    FROM recordings r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `);
}

export function getRecordingById(id) {
  return get('SELECT id, user_id, filename, created_at FROM recordings WHERE id = ?', [id]);
}

export function deleteRecording(id) {
  run('DELETE FROM recordings WHERE id = ?', [id]);
}

export function addCheckin(userId, date) {
  try {
    run('INSERT INTO checkins (user_id, date) VALUES (?, ?)', [userId, date]);
    return true;
  } catch (e) {
    if (e.message && e.message.includes('UNIQUE')) return false;
    throw e;
  }
}

function getDateOfISOWeek(y, w) {
  const d = new Date(y, 0, 1);
  const day = d.getDay() || 7;
  const diff = (w - 1) * 7 - (day - 1) + 1;
  d.setDate(diff);
  return d;
}

export function getCheckinsForWeek(userId, year, week) {
  const start = getDateOfISOWeek(year, week);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  return all('SELECT date FROM checkins WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date', [userId, startStr, endStr]).map(r => r.date);
}

export function getCheckinsForUser(userId) {
  return all('SELECT date FROM checkins WHERE user_id = ? ORDER BY date', [userId]).map(r => r.date);
}

export function getScripturePlan(year, week) {
  return get('SELECT id, year, week, day1_text, day2_text, day3_text, day4_text, day5_text, day6_text, day7_text FROM scripture_plans WHERE year = ? AND week = ?', [year, week]);
}

export function createOrUpdateScripturePlan(year, week, segments) {
  const existing = get('SELECT id FROM scripture_plans WHERE year = ? AND week = ?', [year, week]);
  const d1 = (segments[0] ?? '').trim();
  const d2 = (segments[1] ?? '').trim();
  const d3 = (segments[2] ?? '').trim();
  const d4 = (segments[3] ?? '').trim();
  const d5 = (segments[4] ?? '').trim();
  const d6 = (segments[5] ?? '').trim();
  const d7 = (segments[6] ?? '').trim();
  if (existing) {
    run('UPDATE scripture_plans SET day1_text=?, day2_text=?, day3_text=?, day4_text=?, day5_text=?, day6_text=?, day7_text=? WHERE id = ?',
      [d1, d2, d3, d4, d5, d6, d7, existing.id]);
    return existing.id;
  }
  run('INSERT INTO scripture_plans (year, week, day1_text, day2_text, day3_text, day4_text, day5_text, day6_text, day7_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [year, week, d1, d2, d3, d4, d5, d6, d7]);
  return get('SELECT last_insert_rowid() AS id').id;
}

export function listScripturePlans() {
  return all('SELECT id, year, week, created_at FROM scripture_plans ORDER BY year DESC, week DESC');
}

export function addApproval(studentId, approverId, date) {
  try {
    run('INSERT INTO approvals (student_id, approver_id, date) VALUES (?, ?, ?)', [studentId, approverId, date]);
    return true;
  } catch (e) {
    if (e.message && e.message.includes('UNIQUE')) return false;
    throw e;
  }
}

export function getApprovalForDate(studentId, date) {
  return get('SELECT id, approver_id, date FROM approvals WHERE student_id = ? AND date = ?', [studentId, date]);
}

export function getApprovalsForStudent(studentId) {
  return all('SELECT date, approver_id FROM approvals WHERE student_id = ? ORDER BY date DESC', [studentId]);
}

export function listStudents() {
  return all("SELECT id, number, name, role, points, created_at FROM users WHERE role = 'student' ORDER BY id");
}

export function hasAnyUser() {
  return get('SELECT 1 FROM users LIMIT 1') != null;
}

// 積分相關函數
export function getStudentPoints(studentId) {
  const user = get('SELECT points FROM users WHERE id = ?', [studentId]);
  return user ? user.points : 0;
}

export function adjustPoints(studentId, pointsChange, reason, adjustedBy = null, date = null) {
  const today = date || new Date().toISOString().slice(0, 10);
  const currentPoints = getStudentPoints(studentId);
  const newPoints = Math.max(0, currentPoints + pointsChange); // 確保積分不為負數
  
  run('UPDATE users SET points = ? WHERE id = ?', [newPoints, studentId]);
  run('INSERT INTO points_history (student_id, points_change, reason, adjusted_by, date) VALUES (?, ?, ?, ?, ?)',
    [studentId, pointsChange, reason, adjustedBy, today]);
  
  return { oldPoints: currentPoints, newPoints, pointsChange };
}

export function getPointsHistory(studentId, limit = 50) {
  return all(
    'SELECT ph.*, u.name AS adjusted_by_name FROM points_history ph LEFT JOIN users u ON ph.adjusted_by = u.id WHERE ph.student_id = ? ORDER BY ph.created_at DESC LIMIT ?',
    [studentId, limit]
  );
}

export function checkDailyPointsDeduction(studentId, date) {
  // 檢查這一天是否已經扣過分（沒有錄音）
  const record = get('SELECT id FROM points_history WHERE student_id = ? AND date = ? AND reason = ?', 
    [studentId, date, '未錄音扣分']);
  return !!record;
}

export function checkDailyPointsAdded(studentId, date) {
  // 檢查這一天是否已經加過分（完成簽到）
  const record = get('SELECT id FROM points_history WHERE student_id = ? AND date = ? AND reason = ?', 
    [studentId, date, '完成簽到']);
  return !!record;
}
