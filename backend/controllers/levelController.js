const { db } = require('../firebase/firebase.config');
const LEVELS_COLLECTION = 'levels';

exports.addLevel = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newLevel = { title, description, createdAt: new Date() };
    const docRef = await db.collection(LEVELS_COLLECTION).add(newLevel);
    res.status(201).json({ id: docRef.id, ...newLevel });
  } catch (error) {
    console.error("Erreur lors de l'ajout du niveau:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getLevels = async (req, res) => {
  try {
    const snapshot = await db.collection(LEVELS_COLLECTION).get();
    const levels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(levels);
  } catch (error) {
    console.error("Erreur lors de la récupération des niveaux:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.deleteLevel = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(LEVELS_COLLECTION).doc(id).delete();
    res.status(200).json({ message: 'niveau supprimé' });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
