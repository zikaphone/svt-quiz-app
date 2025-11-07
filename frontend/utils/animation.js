export async function animateContentChange(newHTML,elementId="main") {
  const main = document.getElementById(elementId);

  // Déclenche le fondu sortant
  main.classList.add("fade-out");

  // Attendre la fin de l'animation
  await new Promise(resolve => setTimeout(resolve, 300));

  // Changer le contenu
  main.innerHTML = newHTML;

  // Réactiver l’apparition
  main.classList.remove("fade-out");
};
export function hide(elementId,smooth=false){
  const elem = document.getElementById(elementId);
if(smooth){
// Ajoute la classe pour commencer la transition
elem.classList.add("fade-out");

// Attends la fin de la transition (500 ms ici), puis cache l'élément
setTimeout(() => {
  elem.style.display = "none";
}, 500);
}
else{
   elem.style.display = "none";
}
}
export async function flipInContentChange(newHTML, elementId = "main") {
  const main = document.getElementById(elementId);

  // Ajoute l'animation de sortie
  main.classList.add("flip-in")

  // Attendre la fin de l'animation de sortie
  await new Promise(resolve => setTimeout(resolve, 200));

  // Changer le contenu
  main.innerHTML = newHTML;

  // Applique l'animation d'entrée
  main.classList.remove("flip-in")
}
export async function flipOutContentChange(newHTML, elementId = "main") {
  const main = document.getElementById(elementId);

  // Ajoute l'animation de sortie
  main.classList.add("flip-out")

  // Attendre la fin de l'animation de sortie
  await new Promise(resolve => setTimeout(resolve, 200));

  // Changer le contenu
  main.innerHTML = newHTML;

  // Applique l'animation d'entrée
  main.classList.remove("flip-out")
}

export async function goToStep(currentElId, fromBack = false) {
  const steps = ['levelList', 'streamList', 'moduleList', 'quizList', 'questionView'];

  // Masquer toutes les étapes
  steps.forEach((stepId) => {
    const el = document.getElementById(stepId);
    if (!el) return;
    el.classList.remove('flip-in', 'flip-out');
    el.classList.remove('visible');
  });

  const current = document.getElementById(currentElId);
  if (!current) return;

  // Ajouter bouton retour si pas à la première étape
  if (currentElId !== 'levelList' && !current.querySelector('.back-button')) {
    const backBtn = document.createElement('button');
    backBtn.className = 'back-button';
   backBtn.innerHTML = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  backBtn.setAttribute('aria-label', 'Retour');
    backBtn.onclick = () => {
      // Animer l’étape actuelle avant de reculer
      current.classList.remove('flip-in');
      current.classList.add('flip-out');

      // Attendre la fin de l’animation avant de reculer
      current.addEventListener(
        'animationend',
        () => {
          const prevStep = steps[steps.indexOf(currentElId) - 1];
          goToStep(prevStep, true);
        },
        { once: true }
      );
    };
    current.prepend(backBtn);
  }

  // Afficher l'étape avec la bonne animation
  current.classList.remove('flip-out');
  current.classList.add('visible');
  !fromBack&&current.classList.add('flip-in');

  // Nettoyer la classe après animation pour pouvoir la rejouer
  current.addEventListener(
    'animationend',
    () => {
      current.classList.remove('flip-in', 'flip-out');
    },
    { once: true }
  );
}
