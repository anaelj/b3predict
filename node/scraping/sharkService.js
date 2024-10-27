const {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
} = require("firebase/firestore");
const db = require("./firebaseConfig");

const collectionName = "sharks";

async function findShark({ sharkName }) {
  const collectionRef = collection(db, collectionName);

  const q = query(collectionRef, where("sharkName", "==", sharkName));

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].ref;
  } else {
    return null;
  }
}

async function getShark({ sharkName }) {
  const collectionRef = collection(db, collectionName);

  const q = query(collectionRef, where("sharkName", "==", sharkName));

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  } else {
    await addDoc(collectionRef, { sharkName });
    return { sharkName };
  }
}

async function updateShark({ sharkName, data }) {
  const docRef = await findShark({ sharkName });
  await updateDoc(docRef, data);
}

module.exports = { getShark, updateShark };
