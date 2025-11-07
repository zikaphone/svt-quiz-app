const { db, auth } = require('../firebase/firebase.config');

exports.saveUser = async (req, res) => {
  const { uid, email, role, name } = req.body;

  try {
    await db.collection("users").doc(uid).set({ email, role, name });
    res.status(200).json({ message: "Utilisateur enregistré avec succès." });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement." });
  }
};




exports.userData = async (req, res) => {
  const { userId } = req.query;

  try {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) return res.status(404).json({ error: 'User not found' });

    const userData = userSnap.data();
    const userStreamId = userData.streamId;
    // Récupérer les résultats utilisateur
    const resultsSnap = await db.collection('results')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();
      
    // Pas de résultats = données par défaut
    if (resultsSnap.empty) {
      const dashboardData = {
        name: userData.name,
        email: userData.email,
        currentQuiz: userData.actualQuiz
          ? await db.collection('quizzes').doc(userData.actualQuiz).get().then(doc => doc.exists ? { id: doc.id, title: doc.data().title } : null)
          : null,
        nextQuiz: null,
        stats: {
          completedQuizzes: 0,
          averageScore: 0,
          skillsMastered: 0,
          attitudesMastered: 0,
          knowledgeMastered: 0,
          acquisitionPercentage: []
        },
        pastQuizzes: []
      };

      return res.json(dashboardData);
    }
  

    // Calcul stats des quiz passés
    const pastQuizzes = [];
    let totalScore = 0;
    let totalResults = 0;

    const quizFetchPromises = resultsSnap.docs.map(doc => {
      const result = doc.data();
      return db.collection('quizzes').doc(result.quizId).get();
    });

    const quizSnaps = await Promise.all(quizFetchPromises);

    for (let i = 0; i < resultsSnap.docs.length; i++) {
      const result = resultsSnap.docs[i].data();
      const quizSnap = quizSnaps[i];
      if (quizSnap.exists) {
        pastQuizzes.push({
          id: result.quizId,
          title: quizSnap.data().title,
          score: result.score
        });
      }
      totalScore += result.score;
      totalResults++;
    }

    const averageScore = totalResults ? Math.round(totalScore / totalResults) : 0;

    // --- Intégration du calcul global par filière ---
  
    const acquisitionPercentage = await computeStreamAcquisitionStats(userStreamId, resultsSnap);

    const stats = {
      completedQuizzes: totalResults,
      averageScore,
      skillsMastered: 0, // à calculer si besoin
      attitudesMastered: 0, // idem
      knowledgeMastered: 0, // idem
      acquisitionPercentage // structure { knowledge: [...], skills: [...], attitudes: [...] }
    };

    const dashboardData = {
      name: userData.name,
      email: userData.email,
      currentQuiz: userData.actualQuiz
        ? await db.collection('quizzes').doc(userData.actualQuiz).get().then(doc => doc.exists ? { id: doc.id, title: doc.data().title } : null)
        : null,
      nextQuiz: null,
      stats,
      pastQuizzes
    };

    return res.json(dashboardData);

  } catch (error) {
    console.error('Error generating dashboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// --- Fonction calculant les stats globales par filière ---
async function computeStreamAcquisitionStats(streamId, resultsSnap) {
  const modulesQuery = db.collection("modules").where("streamId", "==", streamId);
  const modulesSnap = await modulesQuery.get();

  const modulesStats = [];

  for (const moduleDoc of modulesSnap.docs) {
    const moduleData = moduleDoc.data();
    const courseId = moduleData.courseId;

    if (!courseId) continue;

    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) continue;

    const courseData = courseDoc.data();

    const domains = {
      knowledge: courseData.knowledge || [],
      skills: courseData.skills || [],
      attitudes: courseData.attitudes || []
    };

    const domainStats = {
      knowledge: [],
      skills: [],
      attitudes: []
    };

    const allPromises = [];

    for (const [domain, items] of Object.entries(domains)) {
      for (let i = 0; i < items.length; i++) {
        allPromises.push(
          computeAcquisitionPercentage(resultsSnap, courseId, i, domain).then(percentageObj => {
            return {
              ...percentageObj,
              label: items[i],
              index: i,
              domain
            };
          })
        );
      }
    }

    const allResults = await Promise.all(allPromises);

    for (const result of allResults) {
      if (domainStats[result.domain]) {
        domainStats[result.domain].push(result);
      }
    }
const averages = {};
    for (const domain of ['knowledge', 'skills', 'attitudes']) {
      const values = domainStats[domain].map(r => r.percentage).filter(p => p !== null);
      const average = values.length > 0
        ? Math.round(values.reduce((sum, p) => sum + p, 0) / values.length)
        : null;
      averages[domain] = average;
    }
    modulesStats.push({
      moduleTitle: moduleData.title,
      stats: domainStats,
      averages
    });
  }

  return modulesStats; // tableau d'objets { moduleTitle, stats }
}







//fonction de récupération du poucentage d'acquisition d'un acquis selon les résultats le cours et le type : savoir att et compétence
//[
//  { "acquiredId": "S1", "domain": "knowledge", "percentage": 100 },
//  { "acquiredId": "C3", "domain": "skills", "percentage": 66 },
//  { "acquiredId": "A7", "domain": "attitudes", "percentage": 0 }
//  ]
async function computeAcquisitionPercentage(resultsSnap, courseId, targetAcquiredId, domain = 'attitudes') {
  let total = 0;
  let success = 0;
const domainTField = {
  skills: 'cibledSkillsIndexes',              // liste d’indexes de compétences ciblées
  attitudes: 'cibledAttitudesIndexs',        // liste d’indexes d’attitudes ciblées
  knowledge: 'cibledKnowledgeIndexes'         // liste d’indexes de savoirs ciblés
};

  // Étape 1 : récupérer tous les cours du module
  const modulesSnap = await db.collection('modules')
    .where('courseId', '==', courseId)
    .get();
   const moduleDoc = modulesSnap.docs[0]; // Le seul module
  const moduleId = moduleDoc.id
  

  // Étape 2 : récupérer tous les quiz de ces cours
  const quizzesSnap = await db.collection('quizzes')
    .where('moduleId', '==', moduleId)
    .get();

  const quizDocs = quizzesSnap.docs;

 

const userResults = resultsSnap.docs;
// Préparer toutes les requêtes des sous-collections "questions" de chaque quiz
const questionFetchPromises = quizDocs.map((quizDoc) =>
  db.collection('quizzes').doc(quizDoc.id).collection('questions').get()
);

// Exécuter toutes les requêtes en parallèle
const allQuestionsSnaps = await Promise.all(questionFetchPromises);

// Parcourir les résultats
for (let i = 0; i < quizDocs.length; i++) {
  const quizId = quizDocs[i].id;
  const questionsSnap = allQuestionsSnaps[i];

  const resultDoc = userResults.find(r => r.data().quizId === quizId);
  const successIds = resultDoc?.data().successQuestionIds || [];

  for (const qDoc of questionsSnap.docs) {
    const question = qDoc.data();
    const targets = question[domainTField[domain]] || [];

    if (targets.includes(targetAcquiredId)) {
      total++;
      if (successIds.includes(qDoc.id)) {
        success++;
      }
    }
  }
}


  const percentage = total > 0 ? Math.round((success / total) * 100) : null;

  return {
    acquiredId: targetAcquiredId,
    domain,
    percentage
  };
}