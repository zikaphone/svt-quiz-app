const { db } = require('../firebase/firebase.config');
const STREAMS_COLLECTION = 'STREAMS';

exports.addStream = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newStream = { title, description, createdAt: new Date() };
    const docRef = await db.collection(STREAMS_COLLECTION).add(newStream);
    res.status(201).json({ id: docRef.id, ...newStream });
  } catch (error) {
    console.error("Erreur lors de l'ajout du stream:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getStreams = async (req, res) => {
  const { levelId } = req.query;
  try {
    let query = db.collection("streams");
    if (levelId) {
      query = query.where("levelId", "==", levelId);
    }
    const snapshot = await query.get();
    const streams = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(streams);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des filières" });
  }
}

exports.deleteStream = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(STREAMS_COLLECTION).doc(id).delete();
    res.status(200).json({ message: 'filière supprimé' });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
