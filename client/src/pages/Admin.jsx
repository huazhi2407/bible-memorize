import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getISOWeek, toLocalDateString, formatDate } from '../utils/date';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const now = new Date();
const currentYear = now.getFullYear();
const currentWeek = getISOWeek(now);

export default function Admin() {
  const { user, fetchWithAuth, logout, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState('users');
  const [scriptureYear, setScriptureYear] = useState(currentYear);
  const [scriptureWeek, setScriptureWeek] = useState(currentWeek);
  const [segments, setSegments] = useState(Array(7).fill(''));
  const [scriptureSaveMsg, setScriptureSaveMsg] = useState('');
  const [scripturePlansList, setScripturePlansList] = useState([]);
  const [studentApprovals, setStudentApprovals] = useState({});
  const [studentPoints, setStudentPoints] = useState({});
  const [adjustingPoints, setAdjustingPoints] = useState({});
  const [checkinRecordings, setCheckinRecordings] = useState([]);
  const [studentRecordingsMap, setStudentRecordingsMap] = useState({}); // { studentId: [recordings] }

  const loadUsers = useCallback(() => {
    fetchWithAuth('/api/users').then((r) => r.json()).then(setUsers).catch(() => setUsers([]));
  }, [fetchWithAuth]);
  const loadRecordings = useCallback(() => {
    if (user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'parent') {
      fetchWithAuth('/api/recordings')
        .then((r) => {
          if (!r.ok) return [];
          return r.json();
        })
        .then((data) => setRecordings(Array.isArray(data) ? data : []))
        .catch(() => setRecordings([]));
    }
  }, [fetchWithAuth, user]);

  const loadScripturePlan = useCallback((year, week) => {
    fetchWithAuth(`/api/scripture-plans?year=${year}&week=${week}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.segments) setSegments(data.segments.map((s) => s || ''));
        else setSegments(Array(7).fill(''));
      })
      .catch(() => setSegments(Array(7).fill('')));
  }, [fetchWithAuth]);

  const loadScripturePlansList = useCallback(() => {
    fetchWithAuth('/api/scripture-plans/list').then((r) => r.json()).then(setScripturePlansList).catch(() => setScripturePlansList([]));
  }, [fetchWithAuth]);

  const loadStudents = useCallback(() => {
    fetchWithAuth('/api/approvals/students').then((r) => r.json()).then(setStudents).catch(() => setStudents([]));
  }, [fetchWithAuth]);

  const loadStudentRecordings = useCallback((studentId) => {
    fetchWithAuth(`/api/recordings?userId=${studentId}`)
      .then((r) => {
        if (!r.ok) return [];
        return r.json();
      })
      .then((data) => {
        setStudentRecordingsMap((prev) => ({
          ...prev,
          [studentId]: Array.isArray(data) ? data : []
        }));
      })
      .catch(() => {
        setStudentRecordingsMap((prev) => ({
          ...prev,
          [studentId]: []
        }));
      });
  }, [fetchWithAuth]);

  const loadStudentPoints = useCallback((studentId) => {
    fetchWithAuth(`/api/points/student/${studentId}`)
      .then((r) => r.json())
      .then((data) => {
        setStudentPoints((prev) => ({ ...prev, [studentId]: data.points || 0 }));
      })
      .catch(() => {});
  }, [fetchWithAuth]);

  const loadAllStudentsPoints = useCallback(() => {
    fetchWithAuth('/api/points/students')
      .then((r) => r.json())
      .then((students) => {
        const pointsMap = {};
        students.forEach((s) => {
          pointsMap[s.id] = s.points || 0;
        });
        setStudentPoints(pointsMap);
      })
      .catch(() => {});
  }, [fetchWithAuth]);

  const loadStudentApproval = useCallback((studentId, date) => {
    fetchWithAuth(`/api/approvals/check/${studentId}/${date}`)
      .then((r) => r.json())
      .then((data) => {
        setStudentApprovals((prev) => ({ ...prev, [`${studentId}_${date}`]: data.approved }));
      })
      .catch(() => {});
  }, [fetchWithAuth]);

  const loadCheckinRecordings = useCallback(() => {
    // 載入所有簽到日期和錄音，然後配對
    Promise.all([
      fetchWithAuth('/api/checkins/all').then((r) => r.json()).then((data) => data.dates || []).catch(() => []),
      fetchWithAuth('/api/recordings').then((r) => r.ok ? r.json() : []).catch(() => [])
    ]).then(([checkinDates, allRecordings]) => {
      // 對於每個簽到日期，找到該日期對應的錄音（每天一個）
      const matched = checkinDates.map((date) => {
        // 找到該日期對應的錄音（created_at 的日期部分匹配）
        const recording = Array.isArray(allRecordings) ? allRecordings.find((r) => {
          if (!r.created_at) return false;
          const recDate = typeof r.created_at === 'string' ? r.created_at.slice(0, 10) : '';
          return recDate === date;
        }) : null;
        return { date, recording };
      }).filter((item) => item.recording); // 只保留有錄音的簽到記錄
      
      // 按日期降序排序（最新的在前）
      matched.sort((a, b) => b.date.localeCompare(a.date));
      setCheckinRecordings(matched);
    }).catch(() => setCheckinRecordings([]));
  }, [fetchWithAuth]);

  useEffect(() => {
    const canAccess = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'parent';
    if (!canAccess) {
      navigate('/', { replace: true });
      return;
    }
    if (user?.role === 'admin') {
      loadUsers();
      loadRecordings();
    } else {
      loadRecordings();
    }
    loadStudents();
    loadAllStudentsPoints();
    if (user?.role === 'teacher' || user?.role === 'parent') {
      setTab('students');
    }
  }, [user, navigate, loadUsers, loadRecordings, loadStudents, loadAllStudentsPoints]);

  useEffect(() => {
    if ((user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'parent') && tab === 'scripture') {
      loadScripturePlan(scriptureYear, scriptureWeek);
      if (user?.role === 'admin') loadScripturePlansList();
    }
  }, [user?.role, tab, scriptureYear, scriptureWeek, loadScripturePlan, loadScripturePlansList]);

  useEffect(() => {
    if ((user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'parent') && tab === 'students' && students.length > 0) {
      const today = toLocalDateString(new Date()); // 使用本地日期
      students.forEach((s) => {
        loadStudentApproval(s.id, today);
        loadStudentRecordings(s.id); // 載入每個學生的錄音
      });
    }
  }, [user?.role, tab, students, loadStudentApproval, loadStudentRecordings]);

  useEffect(() => {
    if ((user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'parent') && tab === 'checkin-history') {
      loadCheckinRecordings();
    }
  }, [user?.role, tab, loadCheckinRecordings]);

  const deleteUser = (id, name) => {
    if (!confirm(`確定要刪除使用者「${name}」？其錄音與簽到也會一併刪除。`)) return;
    fetchWithAuth(`/api/users/${id}`, { method: 'DELETE' }).then((r) => { if (r.ok) loadUsers(); loadRecordings(); });
  };

  const deleteRecording = (id) => {
    if (!confirm('確定要刪除這則錄音？')) return;
    fetchWithAuth(`/api/recordings/${id}`, { method: 'DELETE' }).then((r) => { if (r.ok) loadRecordings(); });
  };

  const saveScripturePlan = () => {
    setScriptureSaveMsg('');
    fetchWithAuth('/api/scripture-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: scriptureYear, week: scriptureWeek, segments }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setScriptureSaveMsg(data.error);
        else { setScriptureSaveMsg('已儲存'); loadScripturePlansList(); }
      })
      .catch(() => setScriptureSaveMsg('儲存失敗'));
  };

  const approveStudent = (studentId, date) => {
    fetchWithAuth('/api/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, date }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok || data.alreadyApproved) {
          loadStudentApproval(studentId, date);
          loadStudents();
          loadStudentPoints(studentId);
          loadAllStudentsPoints(); // 重新載入所有學生積分以更新排行榜
          loadStudentRecordings(studentId); // 重新載入該學生的錄音（簽到後可能會有清理）
          if (data.autoCheckedIn) {
            setTimeout(() => {
              loadStudentApproval(studentId, date);
            }, 500);
          }
        }
      })
      .catch(() => {});
  };

  const rejectRecording = (studentId, date) => {
    console.log('rejectRecording called:', { studentId, date });
    if (!confirm('確定要標記此錄音為不合格並刪除嗎？學生需要重新錄音。')) {
      console.log('User cancelled');
      return;
    }
    console.log('Sending reject request...');
    fetchWithAuth('/api/approvals/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, date }),
    })
      .then((r) => {
        console.log('Response status:', r.status);
        if (!r.ok) {
          return r.json().then((data) => {
            console.error('API error:', data);
            alert(data.error || '操作失敗');
            throw new Error(data.error || '操作失敗');
          });
        }
        return r.json();
      })
      .then((data) => {
        console.log('Response data:', data);
        if (data.ok) {
          alert(`已刪除 ${data.deletedCount || 0} 筆錄音`);
          loadStudentRecordings(studentId); // 重新載入該學生的錄音
          loadStudentApproval(studentId, date); // 重新載入確認狀態
        }
      })
      .catch((err) => {
        console.error('標記不合格失敗:', err);
        alert('操作失敗：' + (err.message || '未知錯誤'));
      });
  };

  const adjustStudentPoints = (studentId, pointsChange, reason) => {
    if (!reason || reason.trim() === '') {
      alert('請輸入調整原因');
      return;
    }
    fetchWithAuth('/api/points/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, pointsChange: Number(pointsChange), reason: reason.trim() }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          loadStudentPoints(studentId);
          loadAllStudentsPoints(); // 重新載入所有學生積分以更新排行榜
          setAdjustingPoints((prev) => ({ ...prev, [studentId]: false }));
        }
      })
      .catch(() => alert('調整積分失敗'));
  };

  const canAccess = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'parent';
  if (!canAccess) return null;

  return (
    <div className="page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 600 }}>{user?.role === 'admin' ? '管理員' : user?.role === 'teacher' ? '老師' : '家長'}</h1>
          <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
            {user?.role === 'admin' ? '管理使用者與錄音' : '確認學生合格'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={() => navigate('/')} style={btnStyle('#21262d')}>回首頁</button>
          <button type="button" onClick={logout} style={btnStyle('#21262d')}>登出</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'parent') && (
          <>
            <button type="button" onClick={() => setTab('students')} style={tab === 'students' ? btnStyle('#238636') : btnStyle('#21262d')}>學生</button>
            <button type="button" onClick={() => { setTab('checkin-history'); loadCheckinRecordings(); }} style={tab === 'checkin-history' ? btnStyle('#238636') : btnStyle('#21262d')}>歷史簽到錄音</button>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <button type="button" onClick={() => setTab('users')} style={tab === 'users' ? btnStyle('#238636') : btnStyle('#21262d')}>使用者</button>
            <button type="button" onClick={() => setTab('recordings')} style={tab === 'recordings' ? btnStyle('#238636') : btnStyle('#21262d')}>全部錄音</button>
            <button type="button" onClick={() => setTab('scripture')} style={tab === 'scripture' ? btnStyle('#238636') : btnStyle('#21262d')}>本週經文</button>
          </>
        )}
      </div>

      {tab === 'users' && user?.role === 'admin' && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>使用者列表</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {users.map((u) => (
              <li key={u.id} style={{ padding: '0.75rem', background: '#161b22', borderRadius: 8, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span><strong>{u.name}</strong> · 編號 {u.number} · {u.role}</span>
                {u.role !== 'admin' && (
                  <button type="button" onClick={() => deleteUser(u.id, u.name)} style={btnStyle('#da3633')}>刪除帳號</button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'recordings' && user?.role === 'admin' && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>全部錄音（依時間）</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recordings.map((r) => (
              <li key={r.id} style={{ padding: '0.75rem', background: '#161b22', borderRadius: 8, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <audio controls src={API_BASE + r.audioUrl + (token ? `?token=${encodeURIComponent(token)}` : '')} style={{ flex: '1 1 200px', minWidth: 0 }} />
                <span style={{ color: '#8b949e', fontSize: '0.875rem' }}>{r.name}（{r.number}） · {r.created_at ? formatDate(r.created_at) : ''}</span>
                <button type="button" onClick={() => deleteRecording(r.id)} style={btnStyle('#da3633')}>刪除</button>
              </li>
            ))}
          </ul>
          {recordings.length === 0 && <p style={{ color: '#8b949e' }}>尚無錄音</p>}
        </section>
      )}

      {tab === 'students' && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>學生列表</h2>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            查看學生今日是否有錄音，並可確認合格。確認合格後會自動為學生簽到。
          </p>
          
          {/* 積分排行榜 */}
          {students.length > 0 && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#161b22', borderRadius: 8, border: '1px solid #30363d' }}>
              <h3 style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>積分排行榜</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {students
                  .map((s) => ({ ...s, points: studentPoints[s.id] ?? 0 }))
                  .sort((a, b) => b.points - a.points)
                  .map((s, index) => (
                    <div
                      key={s.id}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: index < 3 ? '#1c2128' : '#0d1117',
                        borderRadius: 6,
                        border: index === 0 ? '2px solid #f59e0b' : index === 1 ? '2px solid #8b949e' : index === 2 ? '2px solid #da3633' : '1px solid #30363d',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: index < 3 ? '#f59e0b' : '#8b949e', fontWeight: index < 3 ? 600 : 400, fontSize: '0.875rem', minWidth: '1.5rem' }}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                        </span>
                        <span style={{ color: '#e6edf3', fontSize: '0.875rem' }}>{s.name}</span>
                      </div>
                      <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.875rem' }}>{s.points} 分</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {students.map((s) => {
              const today = toLocalDateString(new Date()); // 使用本地日期，不是 UTC
              // 使用每個學生專屬的錄音列表
              const allStudentRecordings = studentRecordingsMap[s.id] || [];
              const studentRecordings = allStudentRecordings.filter((r) => {
                if (!r || !r.created_at) return false;
                try {
                  // 將 ISO 字串轉換為本地日期字串來比較
                  const recDate = new Date(r.created_at);
                  const recDateStr = toLocalDateString(recDate);
                  return recDateStr === today;
                } catch (e) {
                  // 如果日期解析失敗，嘗試直接比較字串（向後兼容）
                  const dateStr = typeof r.created_at === 'string' ? r.created_at.slice(0, 10) : '';
                  return dateStr === today;
                }
              });
              const hasRecordingToday = studentRecordings.length > 0;
              const isApproved = studentApprovals[`${s.id}_${today}`];
              const points = studentPoints[s.id] ?? 0;
              const isAdjusting = adjustingPoints[s.id];
              return (
                <li key={s.id} style={{ padding: '0.75rem', background: '#161b22', borderRadius: 8, marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <span><strong>{s.name}</strong> · 編號 {s.number}</span>
                      <span style={{ color: '#f59e0b', fontWeight: 600, marginLeft: '0.5rem' }}>積分: {points}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {hasRecordingToday ? (
                        <span style={{ color: '#3fb950', fontSize: '0.875rem' }}>✓ 今日有錄音</span>
                      ) : (
                        <span style={{ color: '#8b949e', fontSize: '0.875rem' }}>今日無錄音</span>
                      )}
                      {hasRecordingToday && (
                        <>
                          <button
                            type="button"
                            onClick={() => approveStudent(s.id, today)}
                            disabled={isApproved}
                            style={{
                              ...btnStyle(isApproved ? '#238636' : '#238636'),
                              opacity: isApproved ? 0.6 : 1,
                              cursor: isApproved ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {isApproved ? '已確認並簽到' : '確認合格並簽到'}
                          </button>
                          {!isApproved && hasRecordingToday && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                rejectRecording(s.id, today);
                              }}
                              style={btnStyle('#da3633')}
                            >
                              不合格請重錄
                            </button>
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setAdjustingPoints((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
                        style={btnStyle('#21262d')}
                      >
                        {isAdjusting ? '取消調整' : '調整積分'}
                      </button>
                    </div>
                  </div>
                  {isAdjusting && (
                    <div style={{ padding: '0.75rem', background: '#0d1117', borderRadius: 6, marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        type="number"
                        id={`points-change-${s.id}`}
                        placeholder="分數變化（正數加分，負數扣分）"
                        style={{ ...inputStyle, width: 200 }}
                      />
                      <input
                        type="text"
                        id={`points-reason-${s.id}`}
                        placeholder="調整原因"
                        style={{ ...inputStyle, width: 200 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const change = document.getElementById(`points-change-${s.id}`).value;
                          const reason = document.getElementById(`points-reason-${s.id}`).value;
                          adjustStudentPoints(s.id, change, reason);
                        }}
                        style={btnStyle('#238636')}
                      >
                        確認調整
                      </button>
                    </div>
                  )}
                  {hasRecordingToday && studentRecordings.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      {studentRecordings.map((r) => (
                        <div key={r.id} style={{ marginBottom: '0.5rem' }}>
                          <audio controls src={API_BASE + r.audioUrl + (token ? `?token=${encodeURIComponent(token)}` : '')} style={{ width: '100%', marginBottom: '0.25rem' }} />
                          <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>{r.created_at ? formatDate(r.created_at) : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {students.length === 0 && <p style={{ color: '#8b949e' }}>尚無學生</p>}
        </section>
      )}

      {tab === 'checkin-history' && (user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'parent') && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>歷史簽到錄音</h2>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '1rem' }}>
            顯示您之前簽到時對應的錄音，每天一個錄音。
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {checkinRecordings.map((item) => (
              <li key={item.date} style={{ padding: '0.75rem', background: '#161b22', borderRadius: 8, marginBottom: '0.75rem' }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: 500, color: '#e6edf3' }}>
                  {item.date}（{new Date(item.date + 'T12:00:00').toLocaleDateString('zh-TW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}）
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <audio controls src={API_BASE + item.recording.audioUrl + (token ? `?token=${encodeURIComponent(token)}` : '')} style={{ flex: '1 1 200px', minWidth: 0 }} />
                  <span style={{ color: '#8b949e', fontSize: '0.875rem' }}>
                    {item.recording.created_at ? new Date(item.recording.created_at).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {checkinRecordings.length === 0 && <p style={{ color: '#8b949e' }}>尚無簽到錄音記錄</p>}
        </section>
      )}

      {tab === 'scripture' && user?.role === 'admin' && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>一週經文（7 天）</h2>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '1rem' }}>
            第一天背第 1 段，第二天背第 1+2 段，依此類推。選定年週後可載入已儲存的經文或填寫新的 7 段後儲存。
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label>年 <input type="number" value={scriptureYear} onChange={(e) => setScriptureYear(Number(e.target.value))} style={inputStyle} min={2020} max={2030} /></label>
            <label>第幾週 <input type="number" value={scriptureWeek} onChange={(e) => setScriptureWeek(Number(e.target.value))} style={inputStyle} min={1} max={53} /></label>
            <button type="button" onClick={() => loadScripturePlan(scriptureYear, scriptureWeek)} style={btnStyle('#21262d')}>載入此週</button>
          </div>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, color: '#8b949e' }}>第 {i + 1} 天</label>
              <textarea value={segments[i] || ''} onChange={(e) => setSegments((s) => { const n = [...s]; n[i] = e.target.value; return n; })} rows={2} style={{ ...inputStyle, width: '100%', resize: 'vertical' }} placeholder={`第 ${i + 1} 段經文`} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={saveScripturePlan} style={btnStyle('#238636')}>儲存此週經文</button>
            {scriptureSaveMsg && <span style={{ color: scriptureSaveMsg === '已儲存' ? '#3fb950' : '#f85149' }}>{scriptureSaveMsg}</span>}
          </div>
          {scripturePlansList.length > 0 && (
            <p style={{ color: '#8b949e', fontSize: '0.875rem', marginTop: '1rem' }}>已儲存：{scripturePlansList.map((p) => `${p.year}年第${p.week}週`).join('、')}</p>
          )}
        </section>
      )}
    </div>
  );
}

const inputStyle = { padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #30363d', background: '#161b22', color: '#e6edf3' };

function btnStyle(bg) {
  return { padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: bg, color: '#fff', fontWeight: 500, cursor: 'pointer' };
}
