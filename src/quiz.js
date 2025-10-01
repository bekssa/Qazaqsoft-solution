class Quiz {
  constructor(data) {
    this.title = data.title;
    this.timeLimit = data.timeLimitSec;
    this.passScore = data.passThreshold;
    this.questions = data.questions;

    this.current = 0;
    this.answers = {};
    this.finished = false;
    this.endTime = Date.now() + this.timeLimit * 1000;
  }

  getCurrentQuestion() {
    return this.questions[this.current];
  }

  answer(optionIndex) {
    if (!this.finished) {
      const q = this.getCurrentQuestion();
      this.answers[q.id] = q.options[optionIndex];
    }
  }

  next() {
    if (this.current < this.questions.length - 1) this.current++;
  }

  prev() {
    if (this.current > 0) this.current--;
  }

  getSelected() {
    const q = this.getCurrentQuestion();
    return this.answers[q.id];
  }

  getTimeLeft() {
    const left = Math.floor((this.endTime - Date.now()) / 1000);
    return left > 0 ? left : 0;
  }

  finish() {
    this.finished = true;
    let correct = 0;
    this.questions.forEach((q) => {
      if (this.answers[q.id] === q.correct) correct++;
    });
    const total = this.questions.length;
    const percent = correct / total;
    return { correct, total, percent, passed: percent >= this.passScore };
  }
}

export default Quiz;
