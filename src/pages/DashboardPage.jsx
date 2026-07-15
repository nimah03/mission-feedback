import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import {
  RATING_ITEMS,
  COMPREHENSIVE_QUESTIONS,
  PROS_CONS_SECTIONS,
  MAX_RATING_SCORE,
} from "../data/questions.js";

const DASHBOARD_ACCESS_KEY = import.meta.env.VITE_DASHBOARD_KEY ?? "";
const AUTH_SESSION_KEY = "mission_feedback_dashboard_auth";

function DashboardGate({ onUnlock }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (key === DASHBOARD_ACCESS_KEY) {
      sessionStorage.setItem(AUTH_SESSION_KEY, "true");
      onUnlock();
      return;
    }
    setError("접근 키가 올바르지 않습니다.");
  }

  return (
    <div className="card auth-card">
      <h1>결과 대시보드</h1>
      <p className="auth-desc">관리자만 접근할 수 있습니다. 접근 키를 입력해 주세요.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="dashboard_key">
          접근 키
        </label>
        <input
          id="dashboard_key"
          className="text-input"
          type="password"
          placeholder="접근 키를 입력하세요"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setError("");
          }}
          autoComplete="off"
        />
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-large">
          확인
        </button>
      </form>
    </div>
  );
}

export default function DashboardPage() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(AUTH_SESSION_KEY) === "true"
  );
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!authenticated) return;

    async function load() {
      setLoading(true);
      setError("");

      if (!isSupabaseConfigured) {
        setLoading(false);
        setError(
          "Supabase가 연결되지 않았습니다. .env 파일에 URL과 anon key를 입력하세요."
        );
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("feedback_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setResponses(data || []);
      }
      setLoading(false);
    }

    load();
  }, [authenticated]);

  if (!DASHBOARD_ACCESS_KEY) {
    return (
      <div className="banner banner-error">
        대시보드 접근 키가 설정되지 않았습니다. VITE_DASHBOARD_KEY 환경변수를
        입력해 주세요.
      </div>
    );
  }

  if (!authenticated) {
    return <DashboardGate onUnlock={() => setAuthenticated(true)} />;
  }

  // 항목별 평균 점수 계산
  const ratingStats = useMemo(() => {
    return RATING_ITEMS.map((item) => {
      const scores = responses
        .map((r) => r.ratings?.[item.key]?.score)
        .filter((s) => typeof s === "number" && !Number.isNaN(s));
      const count = scores.length;
      const avg =
        count > 0 ? scores.reduce((a, b) => a + b, 0) / count : null;
      return { ...item, avg, count };
    });
  }, [responses]);

  const overallAvg = useMemo(() => {
    const valid = ratingStats.filter((s) => s.avg !== null);
    if (valid.length === 0) return null;
    return valid.reduce((a, b) => a + b.avg, 0) / valid.length;
  }, [ratingStats]);

  function scoreColor(avg) {
    if (avg === null) return "#cbd5e1";
    if (avg >= MAX_RATING_SCORE * 0.8) return "#16a34a";
    if (avg >= MAX_RATING_SCORE * 0.6) return "#65a30d";
    if (avg >= MAX_RATING_SCORE * 0.4) return "#d97706";
    return "#dc2626";
  }

  if (loading) {
    return (
      <div className="card">
        <p>불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return <div className="banner banner-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="card">
        <div className="dash-head">
          <h1>결과 대시보드</h1>
          <div className="dash-actions">
            <div className="dash-summary">
            <div className="stat-box">
              <span className="stat-num">{responses.length}</span>
              <span className="stat-label">총 응답 수</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">
                {overallAvg !== null ? overallAvg.toFixed(1) : "-"}
              </span>
              <span className="stat-label">전체 평균 점수</span>
            </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                sessionStorage.removeItem(AUTH_SESSION_KEY);
                setAuthenticated(false);
              }}
            >
              잠금
            </button>
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="card">
          <p>아직 제출된 피드백이 없습니다.</p>
        </div>
      ) : (
        <>
          {/* 항목별 평균 */}
          <section className="card">
            <h2 className="section-title">항목별 평균 점수</h2>
            <div className="bar-list">
              {ratingStats.map((s) => (
                <div className="bar-row" key={s.key}>
                  <span className="bar-label">{s.label}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${s.avg ? (s.avg / MAX_RATING_SCORE) * 100 : 0}%`,
                        background: scoreColor(s.avg),
                      }}
                    />
                  </div>
                  <span className="bar-value">
                    {s.avg !== null ? s.avg.toFixed(1) : "-"}
                    <span className="bar-count">({s.count})</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 응답 목록 */}
          <section className="card">
            <h2 className="section-title">응답 목록</h2>
            <div className="response-list">
              {responses.map((r) => (
                <button
                  key={r.id}
                  className="response-row"
                  onClick={() => setSelected(r)}
                >
                  <span className="resp-name">{r.respondent_name}</span>
                  <span className="resp-date">
                    {new Date(r.created_at).toLocaleString("ko-KR")}
                  </span>
                  <span className="resp-view">자세히 보기 →</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {selected && (
        <ResponseModal response={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function ResponseModal({ response, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{response.respondent_name} 님의 피드백</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-date">
            제출: {new Date(response.created_at).toLocaleString("ko-KR")}
          </p>

          <h3 className="modal-section">항목별 평가</h3>
          <table className="detail-table">
            <thead>
              <tr>
                <th>항목</th>
                <th>점수</th>
                <th>좋았던 점</th>
                <th>개선할 점</th>
              </tr>
            </thead>
            <tbody>
              {RATING_ITEMS.map((item) => {
                const r = response.ratings?.[item.key] || {};
                return (
                  <tr key={item.key}>
                    <td>{item.label}</td>
                    <td className="td-score">
                      {r.score ?? "-"}
                    </td>
                    <td>{r.good || "-"}</td>
                    <td>{r.improve || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h3 className="modal-section">종합평가</h3>
          {COMPREHENSIVE_QUESTIONS.map((q) => (
            <div className="detail-qa" key={q.key}>
              <p className="detail-q">{q.label}</p>
              <p className="detail-a">
                {response.comprehensive?.[q.key] || "-"}
              </p>
            </div>
          ))}

          {PROS_CONS_SECTIONS.map((s) => (
            <div key={s.key}>
              <h3 className="modal-section">{s.label}</h3>
              <div className="detail-proscons">
                <div>
                  <p className="detail-q good">👍 좋았던 점</p>
                  <p className="detail-a">
                    {response.pros_cons?.[s.key]?.good || "-"}
                  </p>
                </div>
                <div>
                  <p className="detail-q bad">🤔 아쉬웠던 점</p>
                  <p className="detail-a">
                    {response.pros_cons?.[s.key]?.bad || "-"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
