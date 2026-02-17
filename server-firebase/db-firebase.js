import { db } from './firebase-config.js';
import admin from 'firebase-admin';
import bcrypt from 'bcrypt';

const FieldValue = admin.firestore.FieldValue;

// Firestore 集合名稱
const COLLECTIONS = {
  USERS: 'users',
  RECORDINGS: 'recordings',
  CHECKINS: 'checkins',
  SCRIPTURE_PLANS: 'scripture_plans',
  APPROVALS: 'approvals',
  POINTS_HISTORY: 'points_history',
};

// ========== 用戶相關 ==========

function getNextNumber() {
  // Firestore 沒有自動遞增，使用時間戳 + 隨機數
  return String(Date.now() + Math.floor(Math.random() * 1000));
}

export async function createUser(name, password, role = 'user') {
  const number = getNextNumber();
  const passwordHash = bcrypt.hashSync(password, 10);
  
  const userRef = db.collection(COLLECTIONS.USERS).doc();
  const userData = {
    number,
    name,
    password_hash: passwordHash,
    role,
    points: 0,
    created_at: FieldValue.serverTimestamp(),
  };
  
  await userRef.set(userData);
  
  return {
    id: userRef.id,
    number,
    name,
    role,
  };
}

export async function findUserByName(name) {
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .where('name', '==', name)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  };
}

export async function findUserByNumber(number) {
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .where('number', '==', number)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  };
}

export async function findUserById(id) {
  const doc = await db.collection(COLLECTIONS.USERS).doc(id).get();
  if (!doc.exists) return null;
  
  return {
    id: doc.id,
    ...doc.data(),
  };
}

export function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

export async function listUsers() {
  const snapshot = await db.collection(COLLECTIONS.USERS).get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function deleteUser(id) {
  // 刪除用戶及其相關數據
  const batch = db.batch();
  
  // 刪除用戶
  batch.delete(db.collection(COLLECTIONS.USERS).doc(id));
  
  // 刪除相關錄音
  const recordingsSnapshot = await db.collection(COLLECTIONS.RECORDINGS)
    .where('user_id', '==', id)
    .get();
  recordingsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  
  // 刪除相關簽到
  const checkinsSnapshot = await db.collection(COLLECTIONS.CHECKINS)
    .where('user_id', '==', id)
    .get();
  checkinsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  
  await batch.commit();
}

export async function hasAnyUser() {
  try {
    const snapshot = await db.collection(COLLECTIONS.USERS).limit(1).get();
    return !snapshot.empty;
  } catch (error) {
    // 詳細的錯誤診斷
    console.error('Firestore 查詢錯誤詳情:');
    console.error('錯誤代碼:', error.code);
    console.error('錯誤訊息:', error.message);
    console.error('錯誤詳情:', error.details || '無');
    
    // 檢查常見問題
    if (error.code === 5 || error.message.includes('NOT_FOUND')) {
      console.error('\n可能的原因：');
      console.error('1. Firestore 數據庫未創建或未啟用');
      console.error('2. Firestore 創建為 Datastore 模式（應使用 Native 模式）');
      console.error('3. 數據庫位置與服務帳號不匹配');
      console.error('4. 服務帳號權限不足');
      console.error('\n請檢查：');
      console.error('- Firebase Console → Firestore Database → 確認數據庫已創建');
      console.error('- 確認使用的是 Firestore (Native mode)，不是 Datastore');
      console.error('- 確認數據庫位置正確');
      console.error('- 確認服務帳號有 Firestore 權限\n');
    }
    
    throw error; // 重新拋出錯誤以便上層處理
  }
}

// ========== 錄音相關 ==========

export async function createRecording(userId, filename) {
  const recordingRef = db.collection(COLLECTIONS.RECORDINGS).doc();
  await recordingRef.set({
    user_id: userId,
    filename,
    created_at: FieldValue.serverTimestamp(),
  });
  return recordingRef.id;
}

export async function getRecordingsByUser(userId) {
  const snapshot = await db.collection(COLLECTIONS.RECORDINGS)
    .where('user_id', '==', userId)
    .orderBy('created_at', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    created_at: doc.data().created_at?.toDate().toISOString(),
  }));
}

export async function getRecordingsByUserId(userId) {
  // 別名函數，用於兼容
  return getRecordingsByUser(userId);
}

export async function getAllRecordings() {
  const snapshot = await db.collection(COLLECTIONS.RECORDINGS)
    .orderBy('created_at', 'desc')
    .get();
  
  const recordings = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const user = await findUserById(data.user_id);
    recordings.push({
      id: doc.id,
      filename: data.filename,
      created_at: data.created_at?.toDate().toISOString(),
      user_id: data.user_id,
      name: user?.name || '',
      number: user?.number || '',
    });
  }
  
  return recordings;
}

export async function getRecordingById(id) {
  const doc = await db.collection(COLLECTIONS.RECORDINGS).doc(id).get();
  if (!doc.exists) return null;
  
  return {
    id: doc.id,
    ...doc.data(),
    created_at: doc.data().created_at?.toDate().toISOString(),
  };
}

export async function getRecordingByFilename(filename) {
  const snapshot = await db.collection(COLLECTIONS.RECORDINGS)
    .where('filename', '==', filename)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    created_at: data.created_at?.toDate().toISOString(),
  };
}

export async function deleteRecording(id) {
  await db.collection(COLLECTIONS.RECORDINGS).doc(id).delete();
}

// ========== 簽到相關 ==========

export async function addCheckin(userId, date) {
  // 檢查是否已簽到
  const snapshot = await db.collection(COLLECTIONS.CHECKINS)
    .where('user_id', '==', userId)
    .where('date', '==', date)
    .limit(1)
    .get();
  
  if (!snapshot.empty) return false;
  
  await db.collection(COLLECTIONS.CHECKINS).add({
    user_id: userId,
    date,
    created_at: FieldValue.serverTimestamp(),
  });
  
  return true;
}

/** 依本地日期輸出 YYYY-MM-DD，避免 UTC 造成日期錯位 */
function toLocalDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** ISO 週：該年該週的週一（與前端 getWeekDates 一致） */
function getDateOfISOWeek(y, w) {
  const jan4 = new Date(y, 0, 4);
  const isoDayJan4 = jan4.getDay() === 0 ? 7 : jan4.getDay();
  const mondayWeek1 = new Date(y, 0, 4 - (isoDayJan4 - 1));
  const mondayOfWeek = new Date(mondayWeek1);
  mondayOfWeek.setDate(mondayWeek1.getDate() + (w - 1) * 7);
  return mondayOfWeek;
}

export async function getCheckinsForWeek(userId, year, week) {
  const start = getDateOfISOWeek(year, week);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startStr = toLocalDateStr(start);
  const endStr = toLocalDateStr(end);
  
  const snapshot = await db.collection(COLLECTIONS.CHECKINS)
    .where('user_id', '==', userId)
    .where('date', '>=', startStr)
    .where('date', '<=', endStr)
    .get();
  
  return snapshot.docs.map(doc => doc.data().date);
}

export async function getCheckinsForUser(userId) {
  const snapshot = await db.collection(COLLECTIONS.CHECKINS)
    .where('user_id', '==', userId)
    .get();
  
  // 手動排序，因為 Firestore 需要索引才能同時使用 where 和 orderBy
  const dates = snapshot.docs.map(doc => doc.data().date);
  return dates.sort();
}

// ========== 經文計劃相關 ==========

export async function getScripturePlan(year, week) {
  const snapshot = await db.collection(COLLECTIONS.SCRIPTURE_PLANS)
    .where('year', '==', year)
    .where('week', '==', week)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    year: data.year,
    week: data.week,
    segments: [
      data.day1_text || '',
      data.day2_text || '',
      data.day3_text || '',
      data.day4_text || '',
      data.day5_text || '',
      data.day6_text || '',
      data.day7_text || '',
    ],
  };
}

export async function createOrUpdateScripturePlan(year, week, segments) {
  const snapshot = await db.collection(COLLECTIONS.SCRIPTURE_PLANS)
    .where('year', '==', year)
    .where('week', '==', week)
    .limit(1)
    .get();
  
  const planData = {
    year,
    week,
    day1_text: (segments[0] ?? '').trim(),
    day2_text: (segments[1] ?? '').trim(),
    day3_text: (segments[2] ?? '').trim(),
    day4_text: (segments[3] ?? '').trim(),
    day5_text: (segments[4] ?? '').trim(),
    day6_text: (segments[5] ?? '').trim(),
    day7_text: (segments[6] ?? '').trim(),
    created_at: FieldValue.serverTimestamp(),
  };
  
  if (!snapshot.empty) {
    await snapshot.docs[0].ref.update(planData);
    return snapshot.docs[0].id;
  } else {
    const docRef = await db.collection(COLLECTIONS.SCRIPTURE_PLANS).add(planData);
    return docRef.id;
  }
}

export async function listScripturePlans() {
  const snapshot = await db.collection(COLLECTIONS.SCRIPTURE_PLANS)
    .orderBy('year', 'desc')
    .orderBy('week', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    created_at: doc.data().created_at?.toDate().toISOString(),
  }));
}

// ========== 確認相關 ==========

export async function addApproval(studentId, approverId, date) {
  // 檢查是否已確認
  const snapshot = await db.collection(COLLECTIONS.APPROVALS)
    .where('student_id', '==', studentId)
    .where('date', '==', date)
    .limit(1)
    .get();
  
  if (!snapshot.empty) return false;
  
  await db.collection(COLLECTIONS.APPROVALS).add({
    student_id: studentId,
    approver_id: approverId,
    date,
    created_at: FieldValue.serverTimestamp(),
  });
  
  return true;
}

export async function getApprovalForDate(studentId, date) {
  const snapshot = await db.collection(COLLECTIONS.APPROVALS)
    .where('student_id', '==', studentId)
    .where('date', '==', date)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  };
}

export async function getApprovalsForStudent(studentId) {
  const snapshot = await db.collection(COLLECTIONS.APPROVALS)
    .where('student_id', '==', studentId)
    .orderBy('date', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    date: doc.data().date,
    approver_id: doc.data().approver_id,
  }));
}

export async function listStudents() {
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .where('role', '==', 'student')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    created_at: doc.data().created_at?.toDate().toISOString(),
  }));
}

// ========== 積分相關 ==========

export async function getStudentPoints(studentId) {
  const user = await findUserById(studentId);
  return user?.points || 0;
}

export async function adjustPoints(studentId, pointsChange, reason, adjustedBy = null, date = null) {
  const today = date || new Date().toISOString().slice(0, 10);
  const user = await findUserById(studentId);
  const currentPoints = user?.points || 0;
  const newPoints = Math.max(0, currentPoints + pointsChange);
  
  // 更新用戶積分
  await db.collection(COLLECTIONS.USERS).doc(studentId).update({
    points: newPoints,
  });
  
  // 記錄積分歷史
  await db.collection(COLLECTIONS.POINTS_HISTORY).add({
    student_id: studentId,
    points_change: pointsChange,
    reason,
    adjusted_by: adjustedBy,
    date: today,
    created_at: FieldValue.serverTimestamp(),
  });
  
  return { oldPoints: currentPoints, newPoints, pointsChange };
}

export async function getPointsHistory(studentId, limit = 50) {
  const snapshot = await db.collection(COLLECTIONS.POINTS_HISTORY)
    .where('student_id', '==', studentId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .get();
  
  const history = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let adjustedByName = null;
    if (data.adjusted_by) {
      const user = await findUserById(data.adjusted_by);
      adjustedByName = user?.name || null;
    }
    history.push({
      id: doc.id,
      ...data,
      adjusted_by_name: adjustedByName,
      created_at: data.created_at?.toDate().toISOString(),
    });
  }
  
  return history;
}

export async function checkDailyPointsDeduction(studentId, date) {
  const snapshot = await db.collection(COLLECTIONS.POINTS_HISTORY)
    .where('student_id', '==', studentId)
    .where('date', '==', date)
    .where('reason', '==', '未錄音扣分')
    .limit(1)
    .get();
  
  return !snapshot.empty;
}

export async function checkDailyPointsAdded(studentId, date) {
  const snapshot = await db.collection(COLLECTIONS.POINTS_HISTORY)
    .where('student_id', '==', studentId)
    .where('date', '==', date)
    .where('reason', '==', '完成簽到')
    .limit(1)
    .get();
  
  return !snapshot.empty;
}
