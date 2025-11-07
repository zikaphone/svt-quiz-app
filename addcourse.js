const { db, auth } = require('./backend/firebase/firebase.config');
const fs = require("fs");



// Charger les quizzes depuis le JSON
const quizzes = JSON.parse(fs.readFileSync("datacourse.json", "utf8"));
console.log(quizzes)
async function importQuizzes() {
  for (const item of quizzes) {

    // Ajouter le quiz à la collection "quizzes"
    const quizRef = await db.collection("courses").doc(item.id).set(item);
    console.log(`✅ Cours ajouté : ${item.title}`);

  }

  console.log("✅ Importation terminée !");
}

importQuizzes().catch((error) => {
  console.error("❌ Erreur lors de l'importation :", error);
});
