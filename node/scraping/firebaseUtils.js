const {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  setDoc,
  doc,
} = require("firebase/firestore");
const db = require("./firebaseConfig");

async function fetchAndUpdateDocumentByName({ collectionName, data }) {
  const collectionRef = collection(db, collectionName);

  const q = query(
    collectionRef,
    where("tickerShortName", "==", data.tickerShortName)
  );

  try {
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;

      const existingData = querySnapshot.docs[0].data();
      // console.log(querySnapshot.docs[0].data());

      if (existingData.tickerName === data.tickerName) {
        await updateDoc(docRef, data);
        console.log("update", data.tickerName);
      } else {
        console.log(
          "dont updated, other tickerName",
          data.tickerName,
          data.tickerShortName
        );
      }
    } else {
      await addDoc(collectionRef, { ...data });
      console.log("Documento adicionado:", data.tickerName);
    }
  } catch (error) {
    console.error("Erro ao buscar ou atualizar o documento: ", error);
  }
}

module.exports = fetchAndUpdateDocumentByName;
