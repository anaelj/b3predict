import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./../firebase";

const Sharks = () => {
  const [sharks, setSharks] = useState();

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "sharks"));
      const sharksData = querySnapshot.docs.map((doc) => doc.data());

      const finalSharkData = sharksData
        .map((shark) => ({
          ...shark,
          enterprises: shark?.tickers?.length || 0,
        }))
        .sort((a, b) => b.enterprises - a.enterprises);

      setSharks(finalSharkData);
    } catch (error) {
      console.error("Erro ao buscar dados: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log("sharks", sharks);

  const table = sharks?.map((sharkItem, index) => {
    const { sharkName, enterprises, tickers } = sharkItem;

    return (
      <>
        <tr key={index}>
          <td>{sharkName}</td>
          <td>{enterprises}</td>
          <td>
            {JSON.stringify(tickers.map((item) => item.tickerName)).replaceAll(
              '"',
              ""
            )}{" "}
          </td>
        </tr>
      </>
    );
  });

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Investidor</th>
            <th>Empresas</th>
          </tr>
        </thead>
        <tbody>{table}</tbody>
      </table>
    </div>
  );
};

export default Sharks;
