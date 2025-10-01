import Quiz from "../src/quiz.js";

const mockData = {
  title: "Тест по веб-разработке",
  timeLimitSec: 60,
  passThreshold: 0.5,
  questions: [
    { id: "q1", text: "HTML тег?", options: ["<h1>", "<p>"], correct: "<h1>" },
    { id: "q2", text: "CSS свойство цвета?", options: ["color", "bg"], correct: "color" },
  ]
};

describe("Quiz class", () => {
  let quiz;

  beforeEach(() => {
    quiz = new Quiz(mockData);
  });

  test("должен загружать вопросы", () => {
    expect(quiz.questions.length).toBe(2);
    expect(quiz.getCurrentQuestion().id).toBe("q1");
  });

  test("можно ответить на вопрос", () => {
    quiz.answer(0);
    expect(quiz.answers["q1"]).toBe("<h1>");
  });

  test("можно переключать вопросы", () => {
    quiz.next();
    expect(quiz.getCurrentQuestion().id).toBe("q2");
    quiz.prev();
    expect(quiz.getCurrentQuestion().id).toBe("q1");
  });

  test("finish() считает результат", () => {
    quiz.answer(0); // верный
    quiz.next();
    quiz.answer(0); // верный
    const result = quiz.finish();
    expect(result.correct).toBe(2);
    expect(result.total).toBe(2);
    expect(result.passed).toBe(true);
  });

  test("таймер работает", () => {
    const left = quiz.getTimeLeft();
    expect(left).toBeLessThanOrEqual(60);
    expect(left).toBeGreaterThan(0);
  });
});
