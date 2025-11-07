const { db } = require('../firebase/firebase.config');
const LEVELS_COLLECTION = 'levels';

exports.getFullStructure = async (req, res) => {
  try {
    // 1. Charger toutes les collections plates en parallèle
    const [levelsSnap, streamsSnap, modulesSnap, quizzesSnap] = await Promise.all([
      db.collection('levels').get(),
      db.collection('streams').get(),
      db.collection('modules').get(),
      db.collection('quizzes').get(),
    ]);

    // 2. Formatter les documents
    const levels = levelsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), streams: [] }));
    const streams = streamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), modules: [] }));
    const modules = modulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), quizzes: [] }));
    const quizzes = quizzesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), questions: [] }));

    // 3. Charger toutes les questions en parallèle avec Promise.all
    await Promise.all(quizzes.map(async quiz => {
      const questionsSnap = await db.collection(`quizzes/${quiz.id}/questions`).get();
      quiz.questions = questionsSnap.docs.map(qDoc => ({ id: qDoc.id, ...qDoc.data() }));
    }));

    // 4. Assembler la hiérarchie
    for (const module of modules) {
      module.quizzes = quizzes.filter(q => q.moduleId === module.id);
    }

    for (const stream of streams) {
      stream.modules = modules.filter(m => m.streamId === stream.id);
    }

    for (const level of levels) {
      level.streams = streams.filter(s => s.levelId === level.id);
    }

    // 5. Retourner l’arbre final
    res.status(200).json(levels);
  } catch (error) {
    console.error("Erreur lors de la récupération complète :", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};




  exports.getStructuredQuizById = async (req, res) => {
  const quizId = req.params.id;

  try {
    const quizRef = db.collection('quizzes').doc(quizId);
    const quizDoc = await quizRef.get();

    if (!quizDoc.exists) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quizData = quizDoc.data();

    // 🔹 Récupération du module
    const moduleDoc = await db.collection('modules').doc(quizData.moduleId).get();
    const moduleData = moduleDoc.exists ? moduleDoc.data() : {};

    // recuperation de la filière
     const streamDoc = await db.collection('streams').doc(moduleData.streamId).get();
    const streamData = streamDoc.exists ? streamDoc.data() : {};

   //Récupération du niveau 
   const levelDoc = await db.collection('levels').doc(streamData.levelId).get();
    const levelData = levelDoc.exists ? levelDoc.data() : {};
    // 🔹 Récupération du cours lié au module
    const courseSnapshot = await db
      .collection('courses')
      .where('id', '==', moduleData.courseId)
      .limit(1)
      .get();

    if (courseSnapshot.empty) {
      return res.status(404).json({ error: 'Course not found for this module' });
    }

    const courseData = courseSnapshot.docs[0].data();
    const knowledgeList = courseData.knowledge || [];
    const skillsList = courseData.skills || [];
    const attitudesList = courseData.attitudes || [];

    // 🔹 Collecte des index depuis toutes les questions
    const knowledgeIndexes = new Set();
    const skillsIndexes = new Set();
    const attitudesIndexes = new Set();

const questionsSnapshot = await quizRef.collection('questions').get();
    const questionsData = questionsSnapshot.docs.map(doc => doc.data());

    for (const q of questionsData) {
      (q.cibledKnowledgeIndexes || []).forEach(i => knowledgeIndexes.add(i));
      (q.cibledSkillsIndexes || []).forEach(i => skillsIndexes.add(i));
      (q.cibledAttitudesIndexs || []).forEach(i => attitudesIndexes.add(i));
    }

    // 🔹 Mapping des index vers les valeurs dans le cours
    const targetedKnowledge = [...knowledgeIndexes].map(i => knowledgeList[i]).filter(Boolean);
    const targetedSkills = [...skillsIndexes].map(i => skillsList[i]).filter(Boolean);
    const targetedAttitudes = [...attitudesIndexes].map(i => attitudesList[i]).filter(Boolean);

    // 🔹 Structure finale à renvoyer
    const structuredQuiz = {
      title: quizData.title,
      description: quizData.description || '',
      module: moduleData.title,
      description: courseData.description,
      level: levelData.title || '',
      stream: streamData.title || '',
      knowledge: targetedKnowledge,
      competencies: targetedSkills,
      attitudes: targetedAttitudes,
      questions: questionsData.map(q => ({
        text: q.text,
        options: q.options,
        correctAnswer: q.correctIndex,
        explanation: q.explanation || '',
      })),
    };

    res.status(200).json(structuredQuiz);

  } catch (error) {
    console.error('Error getting structured quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};