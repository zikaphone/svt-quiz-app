

const { db } = require('../firebase/firebase.config');

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const structuredQuizCache = new Map();
const {
  loadCache,
  saveCache,
  isCacheValid,
  initializeCacheFromFallback
} = require('../services/cacheService');

exports.deleteQuizById = async (req, res) => {
  const quizId = req.params.id;

  if (!quizId) {
    return res.status(400).json({ error: 'ID du quiz requis.' });
  }

  try {
    await db.collection('quizzes').doc(quizId).delete();
    res.status(200).json({ message: 'Quiz supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du quiz :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du quiz.' });
  }
};
exports.addQuiz = async (req, res) => {
   const { title, moduleId, published,createdBy } = req.body;

  if (!title || !moduleId ) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }

  const quizData = {
    title,
    moduleId,
    published: !!published,
    createdBy, // ou req.user.uid si authentifié
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = await db.collection("quizzes").add(quizData);
   

    res.status(200).json({ message: "Quiz ajouté avec succès.", id: docRef.id });
  } catch (error) {
    console.error("Erreur Firebase :", error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement du quiz." });
  }
};

exports.addQuestionToQuiz = async (req, res) => {
  const { quizId } = req.params;
  const questionData = req.body;

  try {
    const questionsRef = db.collection('quizzes').doc(quizId).collection('questions');
    const newQuestionRef = await questionsRef.add({
      ...questionData,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ message: 'Question ajoutée avec succès.', id: newQuestionRef.id });
  } catch (error) {
    console.error('Erreur ajout question:', error);
    res.status(500).json({ error: 'Erreur lors de l’ajout de la question.' });
  }
};


exports.getFullStructure = async (req, res) => {
  try {
    // 1. Charger cache actuel
    let cache = loadCache();

    if (!cache) {
      // 2. Sinon, init depuis fallback
      console.warn('[getFullStructure] Aucune donnée en cache, chargement fallback.');
      const fallbackData = initializeCacheFromFallback();

      if (fallbackData) {
        res.status(200).json(fallbackData);
      } else {
        res.status(500).json({ error: 'Aucune donnée disponible.' });
      }
    } else {
      // 3. Si cache dispo, le renvoyer immédiatement
      res.status(200).json(cache.data);
    }

    // 4. Mise à jour en arrière-plan (pas bloquante pour la réponse)
    const [levelsSnap, streamsSnap, modulesSnap,coursesSnap, quizzesSnap] = await Promise.all([
      db.collection('levels').get(),
      db.collection('streams').get(),
      db.collection('modules').get(),
      db.collection('courses').get(),
      db.collection('quizzes').get(),
    ]);

    const levels = levelsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), streams: [] }));
    const streams = streamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), modules: [] }));
    const modules = modulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), quizzes: [],prerequisites:[],skills:[],knowledge:[],attitudes:[] }));
    const courses = coursesSnap.docs.map(doc => doc.data());
    const quizzes = quizzesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), questions: [] }));

    await Promise.all(quizzes.map(async quiz => {
      const questionsSnap = await db.collection(`quizzes/${quiz.id}/questions`).get();
      quiz.questions = questionsSnap.docs.map(qDoc => ({ id: qDoc.id, ...qDoc.data() }));
    }));

    for (const module of modules) {
      module.quizzes = quizzes.filter(q => q.moduleId === module.id);
      module.skills = courses.filter(q => module.courseId === q.id)[0].skills;
      module.knowledge = courses.filter(q => module.courseId === q.id)[0].knowledge;
      module.attitudes = courses.filter(q => module.courseId === q.id)[0].attitudes;
      module.prerequisites  = courses.filter(q => module.courseId === q.id)[0].prerequisites;
    
    }
    

    for (const stream of streams) {
      stream.modules = modules.filter(m => m.streamId === stream.id);
    }

    for (const level of levels) {
      level.streams = streams.filter(s => s.levelId === level.id);
    }

    // 5. Mise à jour du cache en tâche de fond
    saveCache(levels);

  } catch (error) {
    console.error('[getFullStructure] Erreur:', error);
    // (Pas de res.status ici car on a déjà répondu plus tôt)
  }
};


exports.getStructuredQuizById = async (req, res) => {
  const quizId = req.params.id;

  // ✅ Vérifier le cache
  const cachedEntry = structuredQuizCache.get(quizId);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS) {
    return res.status(200).json(cachedEntry.data);
  }

  try {
    const quizRef = db.collection('quizzes').doc(quizId);
    const quizDoc = await quizRef.get();

    if (!quizDoc.exists) return res.status(404).json({ error: 'Quiz not found' });

    const quizData = quizDoc.data();

    const moduleRef = db.collection('modules').doc(quizData.moduleId);
    const moduleDoc = await moduleRef.get();
    if (!moduleDoc.exists) return res.status(404).json({ error: 'Module not found' });

    const moduleData = moduleDoc.data();

    const streamDoc = await db.collection('streams').doc(moduleData.streamId).get();

    const streamData = streamDoc.exists ? streamDoc.data() : {};
    const levelId = streamData.levelId || null;

    const [levelDoc, courseSnap] = await Promise.all([
      levelId ? db.collection('levels').doc(levelId).get() : Promise.resolve({ exists: false, data: () => ({}) }),
      db.collection('courses').where('id', '==', moduleData.courseId).limit(1).get()
    ]);

    const levelData = levelDoc.exists ? levelDoc.data() : {};
    if (courseSnap.empty) return res.status(404).json({ error: 'Course not found for this module' });

    const courseData = courseSnap.docs[0].data();
    const { knowledge = [], skills = [], attitudes = [] } = courseData;

    const questionsSnapshot = await quizRef.collection('questions').get();
    const questionsData = questionsSnapshot.docs.map(doc => ({
  id: doc.id,       // Ajoute l'ID du document
  ...doc.data()     // Spread operator pour inclure toutes les données du document
}));

    const knowledgeIndexes = new Set();
    const skillsIndexes = new Set();
    const attitudesIndexes = new Set();

    questionsData.forEach(q => {
      (q.cibledKnowledgeIndexes || []).forEach(i => knowledgeIndexes.add(i));
      (q.cibledSkillsIndexes || []).forEach(i => skillsIndexes.add(i));
      (q.cibledAttitudesIndexs || []).forEach(i => attitudesIndexes.add(i));
    });

    const targetedKnowledge = [...knowledgeIndexes].map(i => knowledge[i]).filter(Boolean);
    const targetedSkills = [...skillsIndexes].map(i => skills[i]).filter(Boolean);
    const targetedAttitudes = [...attitudesIndexes].map(i => attitudes[i]).filter(Boolean);

    const structuredQuiz = {
      title: quizData.title,
      description: quizData.description || '',
      module: moduleData.title,
      courseDescription: courseData.description || '',
      level: levelData.title || '',
      stream: streamData.title || '',
      knowledge: targetedKnowledge,
      competencies: targetedSkills,
      attitudes: targetedAttitudes,
      questions: questionsData.map(q => ({
        id:q.id,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctIndex,
        explanation: q.explanation || '',
      })),
    };

    // 💾 Stocker dans le cache
    structuredQuizCache.set(quizId, {
      data: structuredQuiz,
      timestamp: Date.now(),
    });

    res.status(200).json(structuredQuiz);

  } catch (error) {
    console.error('Error getting structured quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.addResult= async (req, res) => {
  try {
    const { quizId, score, successQuestionIds, timestamp, userId } = req.body;

    if (!quizId || typeof score !== 'number' || !Array.isArray(successQuestionIds) || !timestamp || !userId) {
      return res.status(400).json({ error: 'Données invalides ou manquantes.' });
    }

    // Préparer le doc à insérer
    const resultData = {
      quizId,
      score,
      successQuestionIds,
      timestamp: new Date(timestamp), // convertir en objet Date
      userId,
      createdAt: new Date().toISOString()
    };

    // Ajouter un doc avec ID auto généré
    const docRef = await db.collection('results').add(resultData);

    res.status(201).json({ message: 'Résultat ajouté', id: docRef.id });
  } catch (error) {
    console.error('Erreur ajout résultat :', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'ajout du résultat' });
  }
}