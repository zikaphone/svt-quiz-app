import {renderallList } from "../components/allList.js";

export async function deleteQuiz(id){
    fetch(`http://localhost:3001/api/quizzes/del/${id}`, {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => {
   
  alert(data.message); // "Quiz supprimé avec succès."
})
.catch(err => console.error('Erreur :', err));
 deleteFromAll(id)
}

export async function addNewQuiz(item){
item.createdBy=localStorage.getItem("uid")

const resp=await fetch('http://localhost:3001/api/quizzes/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(item)
});
if(resp.ok){
 const data = await resp.json();  // On récupère le corps JSON
  item.id=data.id
item.questions=[]
insertToAll(item)
//window.all=  await renderallList();
}
}
export async function saveQuestionToQuiz(data, quizId,counter) {
    
  try {
    const response = await fetch(`http://localhost:3001/api/quizzes/add-quest/${quizId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json(); // 

    if (response.ok) {
      data.id = result.id;
      insertToQuizInAll(data, quizId);
      //window.all=  await renderallList();
     
      if(counter)
      counter.innerText = parseInt(counter.innerText || "0") + 1;
    } else {
      alert('Erreur : ' + (result.error || 'inconnue'));
    }

  } catch (err) {
    console.error('Erreur réseau ou serveur:', err);
    alert('Erreur de connexion au serveur : ' + err.message);
  }
}



function insertToAll(quiz){

// Étape 1 : retrouver le module cible
let moduleFound = null;

for (const level of window.all) {
  for (const stream of level.streams) {
    for (const module of stream.modules) {
      if (module.id === quiz.moduleId) {
        moduleFound = module;
        break;
      }
    }
    if (moduleFound) break;
  }
  if (moduleFound) break;
}

// Étape 2 : insérer le quiz
if (moduleFound) {
  if (!moduleFound.quizzes) moduleFound.quizzes = [];
  moduleFound.quizzes.push(quiz);
  alert("Ajout : quiz ajouté avec succès.");
  //filterAndRenderQuizzes(); // met à jour l'affichage
} else {
  console.error("Module introuvable pour l'ID :", quiz.moduleId);
  alert("Erreur : module introuvable pour ce quiz.");
}
}
function insertToQuizInAll(question,quizId){

// Étape 1 : retrouver le module cible
let quizFound = null;

for (const level of window.all) {
  for (const stream of level.streams) {
    for (const module of stream.modules) {
      for (const quiz of module.quizzes) {
      if (quiz.id === quizId) {
        quizFound = quiz;
        break;
      }
    }
    if (quizFound) break;
    }
    if (quizFound) break;
  }
  if (quizFound) break;
}

// Étape 2 : insérer le quiz
if (quizFound) {
  if (!quizFound.questions) quizFound.questions = [];
  quizFound.questions.push(question);
   alert('Question ajoutée avec succès.');
  //filterAndRenderQuizzes(); // met à jour l'affichage
} else {
  console.error("Quiz introuvable pour l'ID :", quizId);
  alert("Erreur : Quiz introuvable pour cette question.");
}
}

function deleteFromAll(id){

// Étape 1 : retrouver le module cible
let quizFound = null;
let moduleFound = null;

for (const level of window.all) {
  for (const stream of level.streams) {
     for (const module of stream.modules) {
    for (const quiz of module.quizzes) {
      if (quiz.id === id) {
        quizFound = quiz;
        moduleFound=module
        break;
      }
    }
    if (quizFound) break;
    }
    if (quizFound) break;
  }
  if (quizFound) break;
}

// Étape 2 : insérer le quiz
if (quizFound) {
  moduleFound.quizzes=moduleFound.quizzes.filter(qz => qz.id !== id);
} else {
  console.error("Module introuvable pour l'ID :", quiz.moduleId);
  alert("Erreur : quiz introuvable .");
}
}

export  async function saveQuizResult(resultData) {
  try {
    const response = await fetch('http://localhost:3001/api/quizzes/add-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData)
    });

    if (!response.ok) {
      const errorData = await response.json();
   
      return;
    }

    const result = await response.json();
    console.log('Résultat enregistré avec l’ID :', result.id);
  } catch (err) {
    console.error('Erreur réseau :', err);
  }
}
