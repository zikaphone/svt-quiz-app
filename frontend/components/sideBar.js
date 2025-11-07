 import {startQuiz} from './quizView.js'
export function renderSideBar( currentQuizId) {
  let data=window.all
  const div = document.createElement("div");
  div.id = "sidebar";
  div.classList.add("sidebar");
  div.textContent = "";
  if(window.userData.role==="invité"){  createSidebarMenu(data, currentQuizId,div);
}

      else if (window.userData.role !== "admin") {  
        createLearningProgressLine(div);    
      }else{
       adminSide(div);
      }
  return div; // ✅ retourne un élément DOM

}
function adminSide(div){
div.innerHTML=  `<div class="admin-sidebar" role="navigation" aria-label="Menu administration">
      <h2><i class="material-icons">settings</i>Administration</h2>
      <nav>
        <button data-section="quiz" class="active" aria-current="page"><i class="material-icons">assignment</i> Quiz</button>
        <button data-section="levels"><i class="material-icons">school</i> Niveaux</button>
        <button data-section="streams"><i class="material-icons">menu_book</i> Filières</button>
        <button data-section="modules"><i class="material-icons">science</i> Modules</button>
      </nav>
    </div> `;
}




  function createSidebarMenu(data, currentQuizId,div) {
    const sidebar =div
    sidebar.innerHTML = ""; // Reset

    const levelList = document.createElement("ul");

    data.forEach(level => {
      const levelItem = document.createElement("li");
      levelItem.classList.add("collapsible");

      const levelLabel = document.createElement("span");
      levelLabel.textContent = level.title;
      levelLabel.addEventListener("click", () => levelItem.classList.toggle("open"));

      const streamList = document.createElement("ul");

      level.streams.forEach(stream => {
        const streamItem = document.createElement("li");
        streamItem.classList.add("collapsible");

        const streamLabel = document.createElement("span");
        streamLabel.textContent = stream.title;
        streamLabel.addEventListener("click", () => streamItem.classList.toggle("open"));

        const moduleList = document.createElement("ul");

        stream.modules.forEach(module => {
          const moduleItem = document.createElement("li");
          moduleItem.classList.add("collapsible");

          const moduleLabel = document.createElement("span");
          moduleLabel.textContent = module.title;
          moduleLabel.addEventListener("click", () => moduleItem.classList.toggle("open"));

          const quizList = document.createElement("ul");

          module.quizzes.forEach(quiz => {
            const quizItem = document.createElement("li");
            quizItem.classList.add("quiz-item");
            if (quiz.id === currentQuizId) quizItem.classList.add("active");
            quizItem.textContent = quiz.title;
            quizItem.addEventListener("click", () => {
              startQuiz(quiz.id);
              document.querySelectorAll(".quiz-item").forEach(q => q.classList.remove("active"));
              quizItem.classList.add("active");
            });
            quizList.appendChild(quizItem);
          });

          moduleItem.appendChild(moduleLabel);
          moduleItem.appendChild(quizList);
          moduleList.appendChild(moduleItem);
        });

        streamItem.appendChild(streamLabel);
        streamItem.appendChild(moduleList);
        streamList.appendChild(streamItem);
      });

      levelItem.appendChild(levelLabel);
      levelItem.appendChild(streamList);
      levelList.appendChild(levelItem);
    });

    sidebar.appendChild(levelList);
  }

function percentageToColor(percentage) {
  const startColor = { r: 200, g: 200, b: 200 }; // gris clair
  const endColor = { r: 0, g: 200, b: 0 };       // vert

  const r = Math.round(startColor.r + (endColor.r - startColor.r) * (percentage / 100));
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * (percentage / 100));
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * (percentage / 100));

  return `rgb(${r}, ${g}, ${b})`;
}

 function createLearningProgressLine(sidebar) {
   const userStreamId = window.userData.streamId;
const acquisitionStats = window.userData.stats.acquisitionPercentage || [];

const modules = [];

window.all.forEach(level => {
  level.streams.forEach(stream => {
    if (stream.id === userStreamId) {
      stream.modules.forEach(module => {
        const statsForModule = acquisitionStats.find(
          stat => stat.moduleTitle === module.title
        );

        const knowledge = statsForModule?.averages?.knowledge;
        const skills = statsForModule?.averages?.skills;
        const attitudes = statsForModule?.averages?.attitudes;

        const values = [knowledge, skills, attitudes].filter(v => typeof v === 'number');
        const acquisitionPercent = values.length
          ? (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2)
          : null;

        modules.push({
          label: module.title,
          startDate: module.startDate || null,
          endDate: module.endDate || null,
          acquisitionPercent
        });
      });
    }
  });
});

  injectStyles()
     const container = document.createElement("div");
  container.className = "learning-line";

  const today = new Date();
 const title = document.createElement("h2");
  title.textContent=`Suivi de l'évolution et régulation des apprentissages`

container.appendChild(title)
  modules.forEach((mod, index) => {
    // Crée la station (module)
    const station = document.createElement("div");
    station.className = "station";

    const circle = document.createElement("div");
    circle.className = "circle";

    // Couleur du cercle selon acquisition %
    const acq = mod.acquisitionPercent || 0;
    let color = percentageToColor(acq)                 

    circle.style.backgroundColor = color;

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = `${mod.label}`;

    const acqInfo = document.createElement("div");
    acqInfo.className = "acquisition";
    acqInfo.textContent = `Acquis: ${acq}%`;

    /*const dates = document.createElement("div");
    dates.className = "dates";
    dates.textContent = `${mod.startDate} → ${mod.endDate}`;*/

    station.appendChild(circle);
    station.appendChild(label);
    station.appendChild(acqInfo);
   // station.appendChild(dates);
    container.appendChild(station);

    // Ligne de progression temporelle
    if (index < modules.length - 1) {
      const segment = document.createElement("div");
      segment.className = "line-segment";

      const start = new Date(mod.startDate);
      const end = new Date(mod.endDate);
      const totalDuration = (end - start) / (1000 * 60 * 60 * 24);
      const elapsed = (Math.min(today, end) - start) / (1000 * 60 * 60 * 24);
      const percentElapsed = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

      segment.style.position = "relative";
      segment.style.height = "80px";
      segment.style.background = "#e0e0e0";
      segment.style.width = "2px";
      segment.style.borderRadius = "3px";
      segment.style.margin = "4px 0";

      const progress = document.createElement("div");
      progress.className = "progress-bar";
      progress.style.position = "absolute";
      progress.style.top = 0;
      progress.style.left = 0;
      progress.style.right = 0;
      progress.style.width = "100%";
      progress.style.height = `${percentElapsed}%`;
      progress.style.borderRadius = "3px";
      progress.style.background = today > end ? "red" : "#2196f3";

      const label = document.createElement("div");
      label.className = "duration-label";
      label.textContent = `${Math.floor(percentElapsed)}%`;
      label.style.position = "absolute";
      label.style.left = "10px";
      label.style.top = "50%";
      label.style.transform = "translateY(-50%)";
      label.style.fontSize = "0.75rem";

      segment.appendChild(progress);
      segment.appendChild(label);
      container.appendChild(segment);
    }
  });

  sidebar.appendChild(container) ;
}




function injectStyles() {
  if (document.getElementById('sideBar-styles')) return; // éviter les doublons

  const style = document.createElement('style');
  style.id = 'sideBar-styles';
  style.textContent = `
 .learning-line {
  display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 20px;
    background: linear-gradient(to bottom, #455a6478, #ffffff);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    max-width: 320px;
    margin: auto;
    font-family: 'Inter', sans-serif;
}
.learning-line h2{
    text-shadow: 1px 1px 2px #FFEBEE;
    color: #4e4779;
}
.station {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
}

.circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  box-shadow:0 0 0 2px rgb(255 255 255 / 93%);
  transition: background-color 0.3s ease;
}

.label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #E57373;
}

.acquisition {
  font-size: 0.75rem;
  font-weight: 500;
  color: #666;
  background: #f1f3f7;
  padding: 2px 8px;
  border-radius: 12px;
}

.dates {
  font-size: 0.72rem;
  color: #999;
  margin-top: 2px;
}

.line-segment {
  position: relative;
  width: 2px;
  height: 80px;
  background-color: #ddd;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, #2196f3, #90caf9);
  transition: height 0.4s ease, background-color 0.4s ease;
  border-radius: 3px;
}

.duration-label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  color: #444;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
 `
  document.head.appendChild(style);
}
  