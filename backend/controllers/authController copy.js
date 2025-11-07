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
    for (const doc of resultsSnap.docs) {
      const result = doc.data();
      const quizSnap = await db.collection('quizzes').doc(result.quizId).get();
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
const toImprove = { skills: [], attitudes: [], knowledge: [] };

for (const doc of resultsSnap.docs) {
  const result = doc.data();
  const resultId = doc.id;
  const quizId = result.quizId; // important !
  const successIds = result.successQuestionIds || [];

  // Charger les questions stockées dans le résultat
  const questionsSnap = await db
    .collection('quizzes')
    .doc(quizId)
    .collection('questions')
    .get();
 
  // Charger le quiz correspondant
  const quizDoc = await db.collection('quizzes').doc(quizId).get();
  const quizData = quizDoc.data();

  const moduleId = quizData.moduleId;
  const moduleDoc = await db.collection('modules').doc(moduleId).get();
  const moduleData = moduleDoc.data();

  const courseId = moduleData.courseId;

  // Charger le cours pour récupérer les métadonnées pédagogiques
  const courseDoc = await db.collection('courses').doc(courseId).get();
  const courseData = courseDoc.data();

const domains = {
    knowledge: courseData.knowledge || [],
    skills: courseData.skills || [],
    attitudes: courseData.attitudes || []
  };
  // Supposons que le cours contient les questions avec leur domaine :
  // courseData.questions = [{ id, title, domain }]
 

 /* questionsSnap.forEach(qDoc => {
    const questionId = qDoc.id;
   const questionData = qDoc.data();


    

    if (successIds.includes(questionId)) {
 questionData.cibledSkillsIndexes.forEach(skid=>{
        acquired.skills.push({title:courseSkills[skid],courseId,courseTitle:courseData.title})
      }) 

// Ajouter les knowledge
questionData.cibledKnowledgeIndexes.forEach(knid=>{
        acquired.knowledge.push({title:courseKnowledge[knid],courseId,courseTitle:courseData.title})
      }) 
// Ajouter les attitudes (si nécessaire)
questionData.cibledAttitudesIndexs.forEach(attid => {
  acquired.attitudes.push({title:courseAttitudes[attid],courseId,courseTitle:courseData.title})
});
    } else {
 questionData.cibledSkillsIndexes.forEach(skid=>{
        toImprove.skills.push({title:courseSkills[skid],courseId,courseTitle:courseData.title})
      }) 

// Ajouter les knowledge
questionData.cibledKnowledgeIndexes.forEach(knid=>{
        toImprove.knowledge.push({title:courseKnowledge[knid],courseId,courseTitle:courseData.title})
      }) 
// Ajouter les attitudes (si nécessaire)
questionData.cibledAttitudesIndexs.forEach(attid => {
  toImprove.attitudes.push({title:courseAttitudes[attid],courseId,courseTitle:courseData.title})
});
    }
  });*/


const results = [];


  for (const [domain, items] of Object.entries(domains)) {
    for (let i = 0; i < items.length; i++) {
      const percentageObj = await computeAcquisitionPercentage(resultsSnap, courseId, i, domain);
      percentageObj.label = items[i]; // ajoute le nom de l’acquis
      results.push(percentageObj);
    }
  }
   acquisitionPercentage.push({moduleTitle:moduleData.title,stats:results});
}
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
      pastQuizzes,
      knowledge: {
        acquired: acquired.knowledge,
        toImprove: toImprove.knowledge
      },
      skills: {
        acquired: acquired.skills,
        toImprove: toImprove.skills
      },
      attitudes: {
        acquired: acquired.attitudes,
        toImprove: toImprove.attitudes
      }
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
  for (const quizDoc of quizDocs) {
    const quizId = quizDoc.id;
    // Étape 3 : récupérer les questions de chaque quiz
    const questionsSnap = await db.collection('quizzes').doc(quizId).collection('questions').get();

    // Trouver les résultats de l'utilisateur pour ce quiz (s'il a répondu)
    const userResults=resultsSnap.docs
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
