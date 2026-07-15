import { useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import {
  RATING_ITEMS,
  COMPREHENSIVE_QUESTIONS,
  PROS_CONS_SECTIONS,
  createEmptyForm,
  MAX_RATING_SCORE,
} from "../data/questions.js";

const SCORES = Array.from({ length: MAX_RATING_SCORE }, (_, i) => i + 1);

export default function FormPage() {
  const [form, setForm] = useState(createEmptyForm);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  function updateRating(key, field, value) {
    setForm((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [key]: { ...prev.ratings[key], [field]: value },
      },
    }));
  }

  function updateComprehensive(key, value) {
    setForm((prev) => ({
      ...prev,
      comprehensive: { ...prev.comprehensive, [key]: value },
    }));
  }

  function updateProsCons(key, field, value) {
    setForm((prev) => ({
      ...prev,
      pros_cons: {
        ...prev.pros_cons,
        [key]: { ...prev.pros_cons[key], [field]: value },
      },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!isSupabaseConfigured) {
      setStatus("error");
      setErrorMsg(
        "Supabase가 아직 연결되지 않았습니다. .env 파일에 URL과 키를 입력한 뒤 서버를 재시작하세요."
      );
      return;
    }

    setStatus("submitting");

    // 점수는 숫자로 변환하여 저장
    const ratingsToSave = {};
    Object.entries(form.ratings).forEach(([key, val]) => {
      ratingsToSave[key] = {
        score: val.score === "" ? null : Number(val.score),
        good: val.good,
        improve: val.improve,
      };
    });

    const { error } = await supabase.from("feedback_responses").insert({
      respondent_name: "익명",
      ratings: ratingsToSave,
      comprehensive: form.comprehensive,
      pros_cons: form.pros_cons,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(createEmptyForm());
    setStatus("idle");
    setErrorMsg("");
  }

  if (status === "success") {
    return (
      <div className="card success-card">
        <div className="success-icon">✓</div>
        <h2>피드백이 제출되었습니다!</h2>
        <p>소중한 피드백을 남겨주셔서 감사합니다. 🙏</p>
        <button className="btn btn-primary" onClick={resetForm}>
          새 피드백 작성하기
        </button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="intro card">
        <h1>단기선교 피드백</h1>
        <p className="intro-desc">
          이번 유학생 단기선교를 돌아보며 솔직한 피드백을 남겨주세요. 여러분의
          의견은 다음 사역을 더 잘 준비하는 데 큰 도움이 됩니다.
        </p>
        <p className="intro-note">모든 피드백은 익명으로 제출됩니다.</p>
      </div>

      {!isSupabaseConfigured && (
        <div className="banner banner-warning">
          ⚠️ Supabase가 아직 연결되지 않았습니다. 관리자는 <code>.env</code> 파일에
          Supabase URL과 anon key를 입력해 주세요. (제출 기능이 비활성화된 미리보기
          상태입니다)
        </div>
      )}

      {errorMsg && status !== "success" && (
        <div className="banner banner-error">{errorMsg}</div>
      )}

      {/* (1) 항목별 평가 */}
      <section className="card">
        <h2 className="section-title">
          <span className="section-num">1</span> 항목별 평가
        </h2>
        <p className="section-desc">
          각 항목을 1~5점으로 평가하고, 좋았던 점과 개선할 점을 적어주세요.
        </p>

        <div className="rating-list">
          {RATING_ITEMS.map((item) => (
            <div className="rating-item" key={item.key}>
              <div className="rating-item-head">
                <h3>{item.label}</h3>
                <div className="score-picker">
                  {SCORES.map((n) => (
                    <button
                      type="button"
                      key={n}
                      className={
                        Number(form.ratings[item.key].score) === n
                          ? "score-chip selected"
                          : "score-chip"
                      }
                      onClick={() => updateRating(item.key, "score", n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rating-item-body">
                <textarea
                  className="text-area small"
                  placeholder="좋았던 점"
                  value={form.ratings[item.key].good}
                  onChange={(e) =>
                    updateRating(item.key, "good", e.target.value)
                  }
                />
                <textarea
                  className="text-area small"
                  placeholder="개선할 점"
                  value={form.ratings[item.key].improve}
                  onChange={(e) =>
                    updateRating(item.key, "improve", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* (2) 종합평가 */}
      <section className="card">
        <h2 className="section-title">
          <span className="section-num">2</span> 종합평가
        </h2>
        <div className="question-list">
          {COMPREHENSIVE_QUESTIONS.map((q) => (
            <div className="question" key={q.key}>
              <label className="field-label" htmlFor={q.key}>
                {q.label}
              </label>
              {q.hints?.length > 0 && (
                <ul className="hints">
                  {q.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
              <textarea
                id={q.key}
                className="text-area"
                placeholder="자유롭게 작성해 주세요"
                value={form.comprehensive[q.key]}
                onChange={(e) => updateComprehensive(q.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* (3)~(5) 좋았던 점 / 아쉬웠던 점 */}
      {PROS_CONS_SECTIONS.map((s, idx) => (
        <section className="card" key={s.key}>
          <h2 className="section-title">
            <span className="section-num">{idx + 3}</span> {s.label}
          </h2>
          <div className="proscons">
            <div className="proscons-col">
              <label className="field-label good">👍 좋았던 점</label>
              <textarea
                className="text-area"
                placeholder="좋았던 점을 적어주세요"
                value={form.pros_cons[s.key].good}
                onChange={(e) => updateProsCons(s.key, "good", e.target.value)}
              />
            </div>
            <div className="proscons-col">
              <label className="field-label bad">🤔 아쉬웠던 점</label>
              <textarea
                className="text-area"
                placeholder="아쉬웠던 점을 적어주세요"
                value={form.pros_cons[s.key].bad}
                onChange={(e) => updateProsCons(s.key, "bad", e.target.value)}
              />
            </div>
          </div>
        </section>
      ))}

      <div className="submit-bar">
        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "제출 중..." : "피드백 제출하기"}
        </button>
      </div>
    </form>
  );
}
