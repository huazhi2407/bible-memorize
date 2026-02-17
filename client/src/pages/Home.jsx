import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWeekDates, getISOWeek, formatDate, getISODayOfWeek, toLocalDateString } from '../utils/date';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function Home() {
  const { user, fetchWithAuth, logout, token } = useAuth();
  const [recordings, setRecordings] = useState(() => []);
  const [checkinDates, setCheckinDates] = useState([]);
  const [weekYear, setWeekYear] = useState(() => {
    if (typeof window === 'undefined') return { year: 0, week: 0 };
    const d = new Date();
    return { year: d.getFullYear(), week: getISOWeek(d) };
  });
  const [scripturePlan, setScripturePlan] = useState(null);
  const [isApprovedToday, setIsApprovedToday] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [points, setPoints] = useState(0);
  const [studentsRanking, setStudentsRanking] = useState([]);
  const [todayStr, setTodayStr] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // 僅在瀏覽器掛載後設定「今天」與「本週」，避免 SSR/預渲染用伺服器 UTC 導致多一天
  useEffect(() => {
    const d = new Date();
    setTodayStr(toLocalDateString(d));
    setWeekYear((prev) => (prev.week === 0 ? { year: d.getFullYear(), week: getISOWeek(d) } : prev));
  }, []);

  const loadRecordings = useCallback(() => {
    return fetchWithAuth('/api/recordings')
      .then((r) => {
        if (!r.ok) return [];
        return r.json();
      })
      .then((data) => {
        setRecordings(Array.isArray(data) ? data : []);
        return data;
      })
      .catch(() => {
        setRecordings([]);
        return [];
      });
  }, [fetchWithAuth]);

  const loadCheckins = useCallback(() => {
    if (!weekYear.week) return;
    fetchWithAuth(`/api/checkins?year=${weekYear.year}&week=${weekYear.week}`)
      .then((r) => {
        if (!r.ok) return { dates: [] };
        return r.json();
      })
      .then((data) => setCheckinDates(Array.isArray(data.dates) ? data.dates : []))
      .catch(() => setCheckinDates([]));
  }, [fetchWithAuth, weekYear]);

  useEffect(() => { loadRecordings(); }, [loadRecordings]);
  useEffect(() => { loadCheckins(); }, [loadCheckins]);

  // 載入積分（僅學生）
  const loadPoints = useCallback(() => {
    if (user?.role !== 'student') return;
    fetchWithAuth('/api/points/me')
      .then((r) => {
        if (!r.ok) return { points: 0 };
        return r.json();
      })
      .then((data) => setPoints(data.points || 0))
      .catch(() => setPoints(0));
  }, [user, fetchWithAuth]);
  useEffect(() => { loadPoints(); }, [loadPoints]);

  // 檢查並扣分（如果沒有錄音）
  const checkDailyPoints = useCallback(() => {
    if (user?.role !== 'student') return;
    const today = toLocalDateString(new Date());
    fetchWithAuth('/api/points/check-daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.deducted) {
          loadPoints(); // 重新載入積分
        }
      })
      .catch(() => {});
  }, [user, fetchWithAuth, loadPoints]);
  useEffect(() => {
    if (user?.role === 'student') {
      checkDailyPoints();
    }
  }, [user, checkDailyPoints]);

  // 載入所有學生的積分排行榜（所有人都可以看到）
  const loadStudentsRanking = useCallback(() => {
    fetchWithAuth('/api/points/students')
      .then((r) => {
        if (!r.ok) return [];
        return r.json();
      })
      .then((data) => {
        const sorted = Array.isArray(data) 
          ? data.sort((a, b) => (b.points || 0) - (a.points || 0))
          : [];
        setStudentsRanking(sorted);
      })
      .catch(() => setStudentsRanking([]));
  }, [fetchWithAuth]);
  useEffect(() => { loadStudentsRanking(); }, [loadStudentsRanking]);
  useEffect(() => { if (status === 'done') loadStudentsRanking(); }, [status, loadStudentsRanking]);

  // 計算變數（todayStr 由 useEffect 在客戶端設定）
  const hasRecordingToday = todayStr && Array.isArray(recordings) && recordings.some((r) => r.created_at && r.created_at.startsWith(todayStr));
  const hasCheckedInToday = todayStr && checkinDates.includes(todayStr);
  const isStudent = user?.role === 'student';
  const canCheckInToday = !isStudent && hasRecordingToday && !hasCheckedInToday;

  const loadScripturePlan = useCallback(() => {
    const d = new Date();
    fetchWithAuth(`/api/scripture-plans?year=${d.getFullYear()}&week=${getISOWeek(d)}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then(setScripturePlan)
      .catch(() => setScripturePlan(null));
  }, [fetchWithAuth]);
  useEffect(() => { loadScripturePlan(); }, [loadScripturePlan]);

  const loadApprovalStatus = useCallback(() => {
    if (user?.role !== 'student') return;
    const today = toLocalDateString(new Date());
    fetchWithAuth(`/api/approvals/check/${user.id}/${today}`)
      .then((r) => {
        if (!r.ok) return { approved: false };
        return r.json();
      })
      .then((data) => setIsApprovedToday(data.approved || false))
      .catch(() => setIsApprovedToday(false));
  }, [user, fetchWithAuth]);
  useEffect(() => { loadApprovalStatus(); }, [loadApprovalStatus]);
      useEffect(() => { if (status === 'done') { loadApprovalStatus(); loadPoints(); loadStudentsRanking(); } }, [status, loadApprovalStatus, loadPoints, loadStudentsRanking]);

  useEffect(() => {
    if (isStudent && hasRecordingToday && !hasCheckedInToday) {
      const interval = setInterval(() => {
        loadApprovalStatus();
        loadCheckins();
        loadPoints();
        loadStudentsRanking();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isStudent, hasRecordingToday, hasCheckedInToday, loadApprovalStatus, loadCheckins, loadPoints, loadStudentsRanking]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current = recorder;
      recorder.start(200);
      setStatus('recording');
      setError('');
    } catch (err) {
      setError('無法取得麥克風：' + (err.message || err));
    }
  }, []);

  const stopAndUpload = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || status !== 'recording') return;
    const stream = recorder.stream;
    setStatus('uploading');
    setError('');
    try {
      // 等待錄音停止並關閉 stream
      await new Promise((resolve) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve();
        };
        recorder.stop();
      });
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      if (blob.size === 0) {
        throw new Error('錄音文件為空，請重新錄音');
      }
      const form = new FormData();
      form.append('audio', blob, 'recording.webm');
      const res = await fetchWithAuth('/api/recordings', { method: 'POST', body: form });
      const text = await res.text();
      if (!text) {
        throw new Error('伺服器無響應，請檢查後端是否正在運行');
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`伺服器響應格式錯誤: ${text.substring(0, 100)}`);
      }
      if (!res.ok) {
        throw new Error(data.error || `上傳失敗 (${res.status})`);
      }
      // 等待錄音列表載入完成後再設定狀態
      await loadRecordings();
      chunksRef.current = [];
      mediaRecorderRef.current = null;
      setStatus('done');
      setError('');
    } catch (err) {
      console.error('上傳錯誤:', err);
      setError(err.message || '上傳失敗，請檢查網絡連接');
      setStatus('error');
      chunksRef.current = [];
      mediaRecorderRef.current = null;
    }
  }, [status, fetchWithAuth, loadRecordings]);

  const doCheckin = useCallback(() => {
    const today = toLocalDateString(new Date());
    fetchWithAuth('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok || data.alreadyCheckedIn) {
          loadCheckins();
          if (isStudent) {
            loadPoints();
            loadStudentsRanking();
          }
        } else if (data.error) {
          setError(data.error);
        }
      })
      .catch(() => {});
  }, [fetchWithAuth, loadCheckins, isStudent, loadPoints, loadStudentsRanking]);

  const deleteRecording = useCallback((id) => {
    if (!confirm('確定要刪除這則錄音？')) return;
    fetchWithAuth(`/api/recordings/${id}`, { method: 'DELETE' })
      .then((r) => { if (r.ok) loadRecordings(); });
  }, [fetchWithAuth, loadRecordings]);

  const weekDates = weekYear.week > 0 ? getWeekDates(weekYear.year, weekYear.week) : [];
  const prevWeek = () => {
    let { year, week } = weekYear;
    week--;
    if (week < 1) { year--; week = 53; }
    setWeekYear({ year, week });
  };
  const nextWeek = () => {
    let { year, week } = weekYear;
    week++;
    if (week > 53) { year++; week = 1; }
    setWeekYear({ year, week });
  };

  return (
    <div className="page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 600 }}>經文背誦</h1>
          <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
            {user?.name} · 編號 {user?.number}
            {isStudent && <span style={{ color: '#f59e0b', fontWeight: 600 }}> · 積分: {points}</span>}
            {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'parent') && (
              <> · <Link to="/admin" style={{ color: '#58a6ff' }}>{user?.role === 'admin' ? '管理員' : user?.role === 'teacher' ? '老師' : '家長'}</Link></>
            )}
          </p>
        </div>
        <button type="button" onClick={logout} style={btnStyle('#21262d')}>登出</button>
      </header>

      {scripturePlan?.segments && (() => {
        const dayIndex = getISODayOfWeek(new Date()) - 1;
        const cumulative = scripturePlan.segments.slice(0, dayIndex + 1).filter(Boolean).join('\n\n');
        if (!cumulative) return null;
        return (
          <section style={{ marginBottom: '2rem', padding: '1rem', background: '#161b22', borderRadius: 12, border: '1px solid #30363d' }}>
            <h2 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '0.5rem' }}>本週應背經文（第 1～{dayIndex + 1} 段）</h2>
            <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.75rem' }}>第一天背第 1 段，第二天背 1+2 段…今日為第 {dayIndex + 1} 天。</p>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{cumulative}</div>
          </section>
        );
      })()}

      {/* 積分排行榜（所有人都可以看到） */}
      {studentsRanking.length > 0 && (
        <section style={{ marginBottom: '2rem', padding: '1rem', background: '#161b22', borderRadius: 12, border: '1px solid #30363d' }}>
          <h2 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>積分排行榜</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
            {studentsRanking.map((s, index) => {
              const isCurrentUser = s.id === user?.id;
              return (
                <div
                  key={s.id}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: isCurrentUser ? '#1c2128' : index < 3 ? '#1c2128' : '#0d1117',
                    borderRadius: 6,
                    border: isCurrentUser 
                      ? '2px solid #58a6ff' 
                      : index === 0 
                        ? '2px solid #f59e0b' 
                        : index === 1 
                          ? '2px solid #8b949e' 
                          : index === 2 
                            ? '2px solid #da3633' 
                            : '1px solid #30363d',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: isCurrentUser ? '#58a6ff' : index < 3 ? '#f59e0b' : '#8b949e', fontWeight: index < 3 || isCurrentUser ? 600 : 400, fontSize: '0.875rem', minWidth: '1.5rem' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </span>
                    <span style={{ color: isCurrentUser ? '#58a6ff' : '#e6edf3', fontSize: '0.875rem', fontWeight: isCurrentUser ? 600 : 400 }}>
                      {s.name}
                      {isCurrentUser && ' (我)'}
                    </span>
                  </div>
                  <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.875rem' }}>{s.points || 0} 分</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>錄音</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {status === 'idle' && <button type="button" onClick={startRecording} style={btnStyle('#238636')}>開始錄音</button>}
          {status === 'recording' && <button type="button" onClick={stopAndUpload} style={btnStyle('#da3633')}>停止並儲存</button>}
          {status === 'uploading' && <span style={{ color: '#8b949e' }}>上傳中…</span>}
          {(status === 'done' || status === 'error') && <button type="button" onClick={() => setStatus('idle')} style={btnStyle('#21262d')}>再錄一次</button>}
        </div>
        {error && <p style={{ color: '#f85149', marginBottom: '0.5rem' }}>{error}</p>}

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {Array.isArray(recordings) && recordings.map((r) => (
            <li key={r.id} style={{ padding: '0.75rem', background: '#161b22', borderRadius: 8, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <audio controls src={API_BASE + r.audioUrl + (token ? `?token=${encodeURIComponent(token)}` : '')} style={{ flex: '1 1 200px', minWidth: 0 }} />
              <span style={{ color: '#8b949e', fontSize: '0.875rem' }}>{formatDate(r.created_at)}</span>
              <button type="button" onClick={() => deleteRecording(r.id)} style={btnStyle('#da3633')}>刪除</button>
            </li>
          ))}
        </ul>
        {(!Array.isArray(recordings) || recordings.length === 0) && <p style={{ color: '#8b949e' }}>尚無錄音，按「開始錄音」錄製後會自動儲存。</p>}
      </section>

      <section>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>週曆簽到</h2>
        <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          {hasCheckedInToday
            ? isStudent
              ? '今日已確認合格並自動簽到 ✓'
              : '今日已簽到 ✓'
            : isStudent
              ? hasRecordingToday
                ? isApprovedToday
                  ? '今日已有錄音且已確認合格，已自動簽到。'
                  : '今日已有錄音，等待老師或家長確認合格後會自動簽到。'
                : '需先完成「今日錄音」，被確認合格後會自動簽到。'
              : hasRecordingToday
                ? '今日已有錄音，可簽到。'
                : '需先完成「今日錄音」並確認有錄音後，才能簽到。'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <button type="button" onClick={prevWeek} style={btnStyle('#21262d')}>上一週</button>
          <span style={{ minWidth: 140, textAlign: 'center' }}>{weekYear.year} 年第 {weekYear.week} 週</span>
          <button type="button" onClick={nextWeek} style={btnStyle('#21262d')}>下一週</button>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
          {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
            <div key={d} style={{ flex: 1, textAlign: 'center', fontWeight: 500, color: '#8b949e', fontSize: '0.875rem' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
          {weekDates.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#8b949e', padding: '0.5rem' }}>載入週曆…</div>
          ) : weekDates.map((d) => {
            const dateStr = toLocalDateString(d);
            const checked = checkinDates.includes(dateStr);
            const isToday = dateStr === todayStr;
            return (
              <div
                key={dateStr}
                style={{
                  padding: '0.5rem',
                  background: checked ? '#238636' : '#161b22',
                  color: checked ? '#fff' : '#8b949e',
                  borderRadius: 6,
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  border: isToday ? '2px solid #58a6ff' : '1px solid #30363d',
                }}
              >
                {d.getDate()}
                {checked && <div style={{ fontSize: '0.7rem', marginTop: 2 }}>✓</div>}
              </div>
            );
          })}
        </div>
        {!isStudent && (
          <button
            type="button"
            onClick={doCheckin}
            disabled={!canCheckInToday}
            style={{
              ...btnStyle(canCheckInToday ? '#238636' : '#21262d'),
              marginTop: '0.75rem',
              opacity: canCheckInToday ? 1 : 0.6,
              cursor: canCheckInToday ? 'pointer' : 'not-allowed',
            }}
          >
            {hasCheckedInToday ? '今日已簽到' : hasRecordingToday ? '今日簽到' : '請先完成今日錄音'}
          </button>
        )}
        {isStudent && hasCheckedInToday && (
          <p style={{ color: '#3fb950', marginTop: '0.75rem', fontSize: '0.875rem' }}>✓ 已確認合格並自動簽到</p>
        )}
      </section>
    </div>
  );
}

function btnStyle(bg) {
  return { padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: bg, color: '#fff', fontWeight: 500, cursor: 'pointer' };
}
