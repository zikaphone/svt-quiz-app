const { db, auth } = require('../firebase/firebase.config');

exports.saveUser=async  (req, res) =>{
  const { uid, email, role,name } = req.body;

  try {
    await db.collection("users").doc(uid).set({ email, role,name });
    res.status(200).json({ message: "Utilisateur enregistré avec succès." });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement." });
  }
}


// Connexion (vérification email/mot de passe)
exports.userData1 = async (req, res) => {
  const { email } = req.query;

  try {
    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    // On suppose qu’il n’y a qu’un seul utilisateur avec cet email
    const userDoc = snapshot.docs[0];
    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    };

    return res.status(200).json({ user: userData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.userData=async (req, res) => {
  const { userId } = req.query;

  try {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ error: 'User not found' });

    const userData = userSnap.data();
    const userStreamId = userData.streamId;
    const resultsSnap = await db.collection('results')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();
// si pas de resultats 
if (resultsSnap.empty) {
  const dashboardData = {
    name: userData.name,
    currentQuiz: userData.actualQuiz
      ? await db.collection('quizzes').doc(userData.actualQuiz).get().then(doc => doc.exists ? { id: doc.id, title: doc.data().title } : null)
      : null,
    nextQuiz: null, // logique à définir selon la progression
    stats: {
      completedQuizzes: 0,
      averageScore: 0,
      skillsMastered: 0,
      attittudesMastred: 0,
      knowledgeMastered: 0,
      acquisitionPercentage:[]
    },
    pastQuizzes: [],
    knowledge: {
      acquired: [],
      toImprove: []
    },
    skills: {
      acquired: [],
      toImprove: []
    },
    attitudes: {
      acquired: [],
      toImprove: []
    }
  };

  return res.json(dashboardData);
}
//----------------------
    const pastQuizzes = [];
    let totalScore = 0;
    let totalResults = 0;
    let allSuccessQuestionIds = [];
const acquisitionPercentage = [];
    const resultDocs = resultsSnap.docs;
const quizFetchPromises = resultDocs.map(doc => {
  const result = doc.data();
  return db.collection('quizzes').doc(result.quizId).get();
});

const quizSnaps = await Promise.all(quizFetchPromises);


for (let i = 0; i < resultDocs.length; i++) {
  const result = resultDocs[i].data();
  const quizSnap = quizSnaps[i];

  if (quizSnap.exists) {
    const quizData = quizSnap.data();
    pastQuizzes.push({
      id: result.quizId,
      title: quizData.title,
      score: result.score,
    });
  }

  totalScore += result.score;
  totalResults++;
  allSuccessQuestionIds = allSuccessQuestionIds.concat(result.successQuestionIds || []);
}


    const averageScore = totalResults ? Math.round(totalScore / totalResults) : 0;

    const acquired = { skills: [], attitudes: [], knowledge: [] };




// Caches locaux
const quizCache = new Map();
const moduleCache = new Map();
const courseCache = new Map();

const processResult = async (doc) => {
  const result = doc.data();
  const resultId = doc.id;
  const quizId = result.quizId;
  const successIds = result.successQuestionIds || [];

  // === Quiz ===
  let quizDoc;
  if (quizCache.has(quizId)) {
    quizDoc = quizCache.get(quizId);
  } else {
    quizDoc = await db.collection('quizzes').doc(quizId).get();
    quizCache.set(quizId, quizDoc);
  }
  const quizData = quizDoc.data();
  const moduleId = quizData.moduleId;

  // === Module ===
  let moduleDoc;
  if (moduleCache.has(moduleId)) {
    moduleDoc = moduleCache.get(moduleId);
  } else {
    moduleDoc = await db.collection('modules').doc(moduleId).get();
    moduleCache.set(moduleId, moduleDoc);
  }
  const moduleData = moduleDoc.data();
  const courseId = moduleData.courseId;

  // === Course ===
  let courseDoc;
  if (courseCache.has(courseId)) {
    courseDoc = courseCache.get(courseId);
  } else {
    courseDoc = await db.collection('courses').doc(courseId).get();
    courseCache.set(courseId, courseDoc);
  }
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
  // === Calcul des statistiques ===
  const allPromises = [];
  for (const [domain, items] of Object.entries(domains)) {
    for (let i = 0; i < items.length; i++) {
      allPromises.push(computeAcquisitionPercentage(resultsSnap, courseId, i, domain).then(percentageObj => {
        percentageObj.label = items[i];
        percentageObj.index = i; // optionnel
        percentageObj.domain = domain;
        return percentageObj;
      })
      );
    }
  }

  const allResults  = await Promise.all(allPromises);
// 🔁 Regrouper les résultats par domaine
for (const result of allResults) {
  if (domainStats[result.domain]) {
    domainStats[result.domain].push(result);
  }
}
  return {
    moduleTitle: moduleData.title,
    stats: domainStats
  };
};

// Appliquer le traitement en parallèle sur tous les résultats
const allAcquisitionResults = await Promise.all(resultsSnap.docs.map(processResult));
acquisitionPercentage.push(...allAcquisitionResults);

    const stats = {
      completedQuizzes: totalResults,
      averageScore,
      skillsMastered: acquired.skills.length,
      attittudesMastred: acquired.attitudes.length,
      knowledgeMastered: acquired.knowledge.length,
      acquisitionPercentage:acquisitionPercentage
    };

    const dashboardData = {
      name: userData.name,
      currentQuiz: userData.actualQuiz
        ? await db.collection('quizzes').doc(userData.actualQuiz).get().then(doc => doc.exists ? { id: doc.id, title: doc.data().title } : null)
        : null,
      nextQuiz: null, // logique à définir selon la progression
      stats,
      pastQuizzes
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error generating dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
