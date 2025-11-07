export async function renderallList() {
  try {
    const res = await fetch("http://localhost:3001/api/quizzes"); // Assure-toi que cette route existe
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Réponse inattendue du serveur");
    return data;
  } catch (err) {
    console.error("Erreur lors de la récupération des niveaux :", err);
    return `<p class="error">Impossible de charger les niveaux.</p>`;
  }
}

