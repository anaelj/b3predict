const {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} = require("firebase/firestore");
const db = require("./firebaseConfig");

const collectionName = "tickers";

async function findTicker({ tickerName }) {
  const collectionRef = collection(db, collectionName);

  const q = query(collectionRef, where("tickerName", "==", tickerName));

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].ref;
  } else {
    return null;
  }
}

async function getTicker({ tickerName }) {
  const collectionRef = collection(db, collectionName);

  const q = query(collectionRef, where("tickerName", "==", tickerName));

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs[0].data();
}

async function updateTicker({ tickerName, data }) {
  const docRef = await findTicker({ tickerName });
  await updateDoc(docRef, data);
}

module.exports = { getTicker, updateTicker };
