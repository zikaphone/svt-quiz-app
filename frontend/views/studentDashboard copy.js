// frontend/views/StudentDashboard.js
import { renderLevelList, attachLevelEvents } from "../components/levelList.js";
export  function renderStudentDashboard() {
  
   const levelsHtml =   renderLevelList();
  return `

 <div class="step-container-vertical">

  <div class="organigram-vertical">
    <div class="organigram-block visible" id="levelList">
      <h3>Niveaux :</h3>
      <div  id="levelList-content">
       ${levelsHtml}
       </div>
    </div>

    <div class="organigram-block" id="streamList">
     <h3></h3>
     <p>Sélectionnez votre filière :</p>
     <div  id="streamList-content"></div>
    </div>

    <div class="organigram-block" id="moduleList">
    <h3></h3>
     <p>Sélectionnez un module :</p>
      <div  id="moduleList-content"></div>
    </div>

    <div class="organigram-block" id="quizList">
    <h3></h3>
     <p>Sélectionnez un quiz :</p>
      <div  id="quizList-content"></div>
    </div>

    <div class="organigram-block" id="questionView">
      <h3>5. Question</h3>
    </div>
  </div>
</div>

  `;
}

export function attachStudentDashboardEvents() {
 attachLevelEvents()
  
}
