import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./../firebase";

function Saldo() {
  const [data, setData] = useState([]);
  const [cpf, setCpf] = useState();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    try {
      if (!cpf) return;
      const querySnapshot = await getDocs(collection(db, cpf));
      const transactions = querySnapshot.docs.map((doc) => doc.data());
      console.log(transactions);
      setData(transactions);
    } catch (error) {
      console.error("Erro ao buscar dados: ", error);
    }
  };

  // Função para converter string de data para objeto Date
  const parseDate = (str) => {
    const [day, month, year] = str.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  // Filtro de período de data
  const filteredData = data.filter((item) => {
    const itemDate = parseDate(item["Data"]);
    const start = startDate
      ? parseDate(startDate)
      : new Date(-8640000000000000); // Data mínima se não houver início
    const end = endDate ? parseDate(endDate) : new Date(8640000000000000); // Data máxima se não houver fim
    return itemDate >= start && itemDate <= end;
  });

  // Ordenar o array pelo campo Data
  const sortedData = filteredData.sort(
    (a, b) => parseDate(a["Data"]) - parseDate(b["Data"])
  );

  // Função para verificar se um valor é numérico
  const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value);

  // Somar valores de crédito e débito
  const creditSum = sortedData
    .filter((item) => item["Entrada/Saída"] === "Credito")
    .reduce((sum, item) => {
      const value = item["Valor da Operação"];
      return sum + (isNumeric(value) ? parseFloat(value) : 0);
    }, 0);

  const debitSum = sortedData
    .filter((item) => item["Entrada/Saída"] === "Debito")
    .reduce((sum, item) => {
      const value = item["Valor da Operação"];
      return sum + (isNumeric(value) ? parseFloat(value) : 0);
    }, 0);

  const saldo = creditSum - debitSum;

  return (
    <div>
      <h1>Saldo</h1>

      <div>
        <label>CPF</label>
        <input
          type="text"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
        <button onClick={fetchData}> Carregar Dados </button>
      </div>

      <div>
        <label>Data de Início: </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div>
        <label>Data de Fim: </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div>
        <h2>Totais</h2>
        <p>Crédito: R$ {creditSum.toFixed(2)}</p>
        <p>Débito: R$ {debitSum.toFixed(2)}</p>
        <p>Saldo: R$ {saldo.toFixed(2)}</p>
      </div>

      <ul>
        {sortedData.map((item, index) => (
          <li key={index}>
            {item["Data"]} - {item["Produto"]}: R$ {item["Valor da Operação"]}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Saldo;
