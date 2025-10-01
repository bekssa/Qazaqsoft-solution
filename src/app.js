// ====== Константы ======
const STATE_KEY = "quiz_state";
const QUESTIONS_URL = "./data/questions.json";
import Quiz from './quiz.js';

// ====== DOM элементы ======
const titleEl = document.querySelector("#quiz-title");
const progressEl = document.querySelector("#progress");
const timerEl = document.querySelector("#timer");
const qTextEl = document.querySelector("#question-text");
const formEl = document.querySelector("#options-form");
const btnPrev = document.querySelector("#btn-prev");
const btnNext = document.querySelector("#btn-next");
const btnFinish = document.querySelector("#btn-finish");
const resultEl = document.querySelector("#result-section");
const resultText = document.querySelector("#result-summary");
const btnReview = document.querySelector("#btn-review");
const btnRestart = document.querySelector("#btn-restart");

let quiz = null;
let timer = null;
let reviewMode = false;

// ====== Работа с localStorage ======
function saveGame(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}
function loadGame() {
  const raw = localStorage.getItem(STATE_KEY);
  return raw ? JSON.parse(raw) : null;
}
function clearGame() {
  localStorage.removeItem(STATE_KEY);
}

// ====== Загрузка вопросов ======
async function loadQuestions() {
  try {
    const res = await fetch(QUESTIONS_URL);
    if (!res.ok) throw new Error("Ошибка загрузки");
    const data = await res.json();

    data.questions = shuffleArray(data.questions).map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));

    return data;
  } catch (e) {
    alert("Не удалось загрузить вопросы");
    console.error(e);
    return null;
  }
}

// ====== Инициализация ======
document.addEventListener("DOMContentLoaded", async () => {
  const data = await loadQuestions();
  if (!data) return;

  const saved = loadGame();
  quiz = new Quiz(data);
  if (saved) {
    Object.assign(quiz, saved);
  }

  titleEl.textContent = quiz.title;

  setupEvents();
  renderAll();
  startTimer();
});

// ====== Таймер ======
function startTimer() {
  stopTimer();
  timer = setInterval(() => {
    const left = quiz.getTimeLeft();
    showTimer();
    saveGame(quiz);
    if (left <= 0 && !quiz.finished) {
      showResult(quiz.finish());
      stopTimer();
      renderAll();
    }
  }, 1000);
}
function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

// ====== Обработчики ======
function setupEvents() {
  btnPrev.addEventListener("click", () => {
    quiz.prev();
    saveGame(quiz);
    renderAll();
  });

  btnNext.addEventListener("click", () => {
    quiz.next();
    saveGame(quiz);
    renderAll();
  });

  btnFinish.addEventListener("click", () => {
    showResult(quiz.finish());
    stopTimer();
    saveGame(quiz);
    renderAll();
  });

  btnReview.addEventListener("click", () => {
    reviewMode = true;
    renderAll();
  });

  btnRestart.addEventListener("click", () => {
    clearGame();
    location.reload();
  });

  formEl.addEventListener("change", (e) => {
    if (quiz.finished) return;
    if (e.target.name === "option") {
      quiz.answer(Number(e.target.value));
      saveGame(quiz);
      showNav();
    }
  });
}

// ====== Рендер ======
function renderAll() {
  showProgress();
  showTimer();
  showQuestion();
  showNav();
}

function shuffleArray(arr) {
  return arr
    .map(item => ({ sort: Math.random(), value: item }))
    .sort((a, b) => a.sort - b.sort)
    .map(item => item.value);
}

function showProgress() {
  progressEl.textContent = `Вопрос ${quiz.current + 1} из ${quiz.questions.length}`;
}

function showTimer() {
  const sec = quiz.getTimeLeft();
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  timerEl.textContent = `${m}:${s}`;
}

function showQuestion() {
  const q = quiz.getCurrentQuestion();
  qTextEl.textContent = q.text;
  formEl.innerHTML = "";

  q.options.forEach((opt, i) => {
    const label = document.createElement("label");
    label.className = "option";

    if (reviewMode) {
      const chosen = quiz.answers[q.id];
      if (opt === q.correct) label.classList.add("correct");
      if (chosen === opt && opt !== q.correct) label.classList.add("incorrect");
    }

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "option";
    input.value = i;
    input.checked = quiz.getSelected() === opt;

    if (quiz.finished) input.disabled = true;

    const span = document.createElement("span");
    span.textContent = opt;

    label.append(input, span);
    formEl.appendChild(label);
  });
}

function showNav() {
  const answered = quiz.getSelected() !== undefined;
  btnPrev.disabled = quiz.current === 0;
  btnNext.disabled = !(quiz.current < quiz.questions.length - 1 && answered);
  btnFinish.disabled = !(quiz.current === quiz.questions.length - 1 && answered);
}

function showResult(summary) {
  resultEl.classList.remove("hidden");
  const pct = Math.round(summary.percent * 100);
  resultText.textContent = `${summary.correct} / ${summary.total} (${pct}%) — ${summary.passed ? "Пройден" : "Не пройден"}`;
}
