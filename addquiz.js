const { db } = require('./backend/firebase/firebase.config');
const fs = require("fs");

// Lire et parser le fichier JSON
const quizzes = JSON.parse(fs.readFileSync("dataquiz.json", "utf8"));

(async () => {
  try {
    for (const quiz of quizzes) {
      const { id, questions, ...quizData } = quiz;
      // Ajouter le document de quiz dans la collection "quiz"
      await db.collection("quizzes").doc(id).set(quizData);
      console.log(`✅ Quiz ${id} ajouté`);

      // Ajouter les questions comme sous-collection
      const questionsCollection = db.collection("quizzes").doc(id).collection("questions");

      for (const [index, question] of questions.entries()) {
        await questionsCollection.add(question);
        console.log(`  ↪ Question ${index + 1} ajoutée au quiz ${id}`);
      }
    }

    console.log("✅ Tous les quizzes ont été importés avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'importation :", error);
  }
})();
