// QuizView.js
import {showLoading} from './loading.js';
import {renderBreadcrumb} from './breadcrumb.js';

let currentQuestion = 0;
let quiz = null;
export default function renderQuizView(quizData) {
  const { title, module, level, stream,description } = quizData;
 
  return `
  <div id="breadcrumb-container"></div>
   <div class="quiz-layout">
  <!-- Colonne gauche -->
  <aside class="quiz-sidebar-left">
    <p><strong>Niveau :</strong> ${level}</p>
    <p><strong>Filière :</strong> ${stream}</p>
    <p><strong>Unité :</strong> ${module}</p>
    <p><strong>Description :</strong><br> ${description}</p>
  </aside>

  <!-- Contenu central -->
 <main class="quiz-question-area">
  <h2 class="quiz-title">${title}</h2>
  <div id="quiz-question-container" class="question-container-centered"></div>
</main>

  <!-- Colonne droite -->
  <aside class="quiz-sidebar-right" id="quiz-meta"></aside>
</div>
  `;
}
function renderMeta({ competencies = [], attitudes = [], knowledge = [] }) {
  const container = document.getElementById("quiz-meta");
  container.innerHTML = ''; // Nettoyer le contenu

  const createSection = (label, items) => {
    if (!items || items.length === 0) return;

    const section = document.createElement("div");

    const title = document.createElement("p");
    title.innerHTML = `<strong>${label} :</strong>`;

    const list = document.createElement("ul");
    list.className = "quiz-meta-list";
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });

    section.appendChild(title);
    section.appendChild(list);
    container.appendChild(section);
  };

  createSection("Compétences", competencies);
  createSection("Attitudes", attitudes);
  createSection("Savoirs", knowledge);
}

export function renderQuestion(question, index, total) {
  return `
    <div class="question fade-in">
      <p><strong>Question ${index + 1} / ${total} :</strong> ${question.text}</p>
      <div class="options">
        ${question.options.map((opt, i) => `
          <button class="option-btn" data-index="${i}">${opt}</button>
        `).join('')}
      </div>
    </div>
  `;
}

export function renderFeedback(isCorrect, explanation = '', isLast = false) {
  return `
    <div class="feedback ${isCorrect ? 'correct' : 'incorrect'} fade-in">
      <p>${isCorrect ? '✅ Bonne réponse !' : '❌ Mauvaise réponse.'}</p>
      ${explanation ? `<p class="explanation">${explanation}</p>` : ''}
      <button id="next-btn" class="next-btn">${isLast ? 'Le quiz est terminé voir le résultat ?' : 'Suivant ➡️'}</button>
    </div>
  `;
}
export function loadQuestion() {
  const container = document.getElementById('quiz-question-container');
  const question = quiz.questions[currentQuestion];
  container.innerHTML = renderQuestion(question, currentQuestion, quiz.questions.length);

  container.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = parseInt(btn.dataset.index);
      const isCorrect = selected === question.correctAnswer;

      const isLast = currentQuestion === quiz.questions.length - 1;
      container.innerHTML = renderFeedback(isCorrect, question.explanation || "", isLast);

      document.getElementById('next-btn').addEventListener('click', () => {
        if (!isLast) {
          currentQuestion++;
          loadQuestion();
        } else {
          container.innerHTML = `<p class="fade-in">🎉 Quiz terminé ! Merci pour votre participation.</p>`;
        }
      });
    });
  });
}
export async function startQuiz(quizId) {
     showLoading();   
    const res = await fetch(`http://localhost:3001/api/quizzes/quiz/${quizId}`); // Assure-toi que cette route existe
    const quizData = await res.json();
   
  quiz = quizData;
  document.getElementById('main').innerHTML = renderQuizView(quizData);
   renderBreadcrumb({currentQuizId:quizId,
    containerId: 'breadcrumb-container'
  });
  renderMeta(quizData)
  loadQuestion();
}