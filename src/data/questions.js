// 성결대 유학생 단기선교 피드백 - 폼 구조 정의
// 원본 구글 문서의 "9. 평가 및 피드백" 구조를 그대로 반영

// (1) 항목별 평가 - 점수(1~5) + 좋았던 점 + 개선할 점
export const MAX_RATING_SCORE = 5;
export const RATING_ITEMS = [
  { key: "pre_meeting", label: "사전 모임" },
  { key: "preparation", label: "사전 준비과정" },
  { key: "gateway", label: "Gateway" },
  { key: "nextstep_ai", label: "Nextstep AI" },
  { key: "morning", label: "아침모임" },
  { key: "cojourers", label: "코저너스" },
  { key: "campus", label: "캠퍼스 전도" },
  { key: "team_meeting", label: "팀모임" },
  { key: "whole_meeting", label: "전체 모임 (마무리 기도회)" },
  { key: "friend", label: "친구 만남" },
  { key: "coworker", label: "동역자 개발" },
  { key: "lodging", label: "숙소" },
  { key: "meal", label: "식사" },
  { key: "handbook", label: "핸드북" },
];

// (2) 종합평가 - 서술형 질문 (하위 힌트 포함)
export const COMPREHENSIVE_QUESTIONS = [
  {
    key: "meaningful",
    label: "이번 단기선교에서 가장 의미 있었던 경험은 무엇이었나요?",
    hints: [
      "하나님께서 가장 크게 역사하셨다고 느낀 순간은 무엇이었나요?",
      "개인적으로 성장했다고 느낀 부분은 무엇이었나요?",
    ],
  },
  {
    key: "difficult",
    label: "어려웠던 점은 무엇이었나요?",
    hints: [
      "언어, 문화, 일정, 팀워크 등에서 어려움은 무엇이었나요?",
      "예상과 달랐던 부분은 무엇이었나요?",
    ],
  },
  {
    key: "improve_ministry",
    label: "사역 측면에서 개선할 점은 무엇인가요?",
    hints: [
      "준비 과정에서 부족했던 점은 무엇인가요?",
      "유학생 사역의 효과를 높이기 위해 필요한 것은 무엇인가요?",
      "팀원 간 역할 분담은 적절했나요?",
    ],
  },
  {
    key: "next_semester",
    label: "유학생 사역의 특성을 고려할 때 다음 학기에 보완하면 좋을 점은 무엇인가요?",
    hints: [
      "유학생 친구들과의 관계 형성 방법 중 도전해 보고 싶은 것은 무엇인가요?",
      "후속 양육 프로그램은 어떻게 진행되면 좋을 것 같나요?",
      "문화적 이해를 위한 사전 교육이 필요하다고 생각하나요?",
      "그 외 필요한 교육 내용은 무엇인가요?",
      "복음 제시 방식은 어떤 식으로 진행되면 좋을까요? 그 여정을 그려보세요.",
    ],
  },
  {
    key: "action_items",
    label: "다음 학기에 실제로 적용할 수 있는 구체적인 실천 사항은 무엇인가요?",
    hints: [
      "준비 기간이 얼마나 확보되면 좋을 것 같나요?",
      "순과 캠퍼스에 적용하고 싶은 것은 무엇인가요?",
    ],
  },
];

// (3)~(5) 좋았던 점 / 아쉬웠던 점 형태의 평가 섹션
export const PROS_CONS_SECTIONS = [
  { key: "welcome_party", label: "웰컴파티 평가" },
  { key: "team", label: "팀 평가" },
  { key: "personal", label: "개인 평가" },
];

export const GENDER_TEAM_OPTIONS = ["형제", "자매"];
export const PARTICIPATION_OPTIONS = ["풀참", "부분참"];

export function getParticipantInfo(response) {
  const stored = response?.comprehensive?._participant ?? {};
  return {
    gender_team: response?.gender_team || stored.gender_team || "",
    participation: response?.participation || stored.participation || "",
  };
}

export function buildComprehensivePayload(form) {
  return {
    ...form.comprehensive,
    _participant: {
      gender_team: form.gender_team,
      participation: form.participation,
    },
  };
}

// 빈 폼 초기값 생성
export function createEmptyForm() {
  const ratings = {};
  RATING_ITEMS.forEach((item) => {
    ratings[item.key] = { score: "", good: "", improve: "" };
  });

  const comprehensive = {};
  COMPREHENSIVE_QUESTIONS.forEach((q) => {
    comprehensive[q.key] = "";
  });

  const prosCons = {};
  PROS_CONS_SECTIONS.forEach((s) => {
    prosCons[s.key] = { good: "", bad: "" };
  });

  return {
    gender_team: "",
    participation: "",
    ratings,
    comprehensive,
    pros_cons: prosCons,
  };
}
