import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "./../firebase";

export async function fetchAndUpdateDocumentByID({ collectionName, data }) {
  const collectionRef = collection(db, collectionName);

  // console.log("data", data, collectionRef);

  const q = query(collectionRef, where("ID", "==", data.ID));

  try {
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // console.log("querySnapshot", querySnapshot);

      const docRef = querySnapshot.docs[0].ref;

      await updateDoc(docRef, { ...data });

      console.log("Documento atualizado com sucesso!");
    } else {
      console.log("Nenhum documento encontrado com o ID especificado.");
    }
  } catch (error) {
    console.error("Erro ao buscar ou atualizar o documento: ", error);
  }
}
