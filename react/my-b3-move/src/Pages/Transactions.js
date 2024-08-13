import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./../firebase";

const Transactions = () => {
  const [transactions, setTransactions] = useState();
  const [cpf, setCpf] = useState("95474358172");
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");

  const handleYearChange = (e) => setYearFilter(e.target.value);
  const handleMonthChange = (e) => setMonthFilter(e.target.value);
  const handleProductChange = (e) => setProductFilter(e.target.value);

  const filteredRows = rows?.filter((transaction) => {
    if (!transaction) return false;

    const { Data: date, Produto } = transaction;
    const transactionDate = new Date(date);
    const transactionYear = transactionDate.getFullYear();
    const transactionMonth = transactionDate.getMonth() + 1; // Janeiro é 0

    const yearMatch = yearFilter
      ? transactionYear === parseInt(yearFilter)
      : true;
    const monthMatch = monthFilter
      ? transactionMonth === parseInt(monthFilter)
      : true;
    const productMatch = productFilter ? Produto.includes(productFilter) : true;

    return yearMatch && monthMatch && productMatch;
  });

  const parseDate = (str) => {
    const [day, month, year] = str.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  const fetchData = async () => {
    try {
      if (!cpf) return;
      const querySnapshot = await getDocs(collection(db, cpf));
      const transactionsData = querySnapshot.docs.map((doc) => doc.data());

      const sortedData = transactionsData.sort(
        (a, b) => parseDate(a["Data"]) - parseDate(b["Data"])
      );

      setTransactions(
        sortedData
          .filter(
            (item) => item["Movimentação"] === "Transferência - Liquidação"
          )
          .map((item) => ({
            ...item,
            balance: item["Entrada/Saída"]?.includes("Debito")
              ? 0
              : item.Quantidade,
          }))
      );
    } catch (error) {
      console.error("Erro ao buscar dados: ", error);
    }
  };
  const isNumeric = (value) => {
    try {
      return parseFloat(value);
    } catch (error) {
      return 0;
    }
  };

  const updateBalance = (data, id, value, product = null) => {
    const index = data.findIndex((item) =>
      id
        ? item.ID === id && item.balance > 0
        : item.Produto === product && item.balance > 0
    );

    if (index === -1) return { price: 0 };
    let price = 0;

    if (data[index].balance >= value) {
      if (data[index].Produto.includes("BLAU3")) {
        console.log("DATA1", data[index]);
      }
      data[index].balance -= value;
      price = data[index].price;
    } else {
      if (data[index].Produto.includes("BLAU3")) {
        console.log("DATA2", data[index]);
        console.log("data, id, value, product ", data, id, value, product);
      }
      const updated = updateBalance(
        data,
        null,
        value - data[index].balance,
        data[index].Produto
      );
      data[index].balance = 0;

      price = (data[index].price + updated.price) / 2;
    }

    return { ...data[index], price };
  };

  const updateDebitTransaction = (data, id, value) => {
    const index = data.findIndex((item) => item.ID === id);
    if (index !== -1) {
      data[index].profit = (data[index].price - value) * data[index].Quantidade;
      return data[index];
    } else {
      console.log("ID não encontrado.");
    }
  };

  const makeData = () => {
    if (!transactions) return;
    let newData = [
      ...transactions.map((item) => ({
        ...item,
        price: item["Preço unitário"],
        type: item["Entrada/Saída"],
      })),
    ];

    // console.log("newData", newData);
    newData
      .filter((debitTransaction) => debitTransaction.type?.includes("Debito"))
      .forEach((debitTransaction) => {
        newData
          .filter(
            (creditTransaction) =>
              creditTransaction.type?.includes("Credito") &&
              creditTransaction.balance > 0 &&
              creditTransaction.Produto === debitTransaction.Produto
          )
          .sort((a, b) => parseDate(b["Data"]) - parseDate(a["Data"]))
          .forEach((creditTransaction) => {
            // if (debitTransaction.Produto.includes("BLAU3")) {
            //   console.log("debitTransaction", debitTransaction);
            //   console.log("creditTransaction", creditTransaction);
            // }
            const { price: buyPrice } = updateBalance(
              newData,
              creditTransaction.ID,
              debitTransaction.Quantidade
            );
            // updateDebitTransaction(newData, debitTransaction.ID, buyPrice);
          });
      });

    setRows(newData);
  };

  useEffect(() => {
    makeData();
    setLoaded(true);
    // }
  }, [transactions]);

  const table = filteredRows?.map((transaction, index) => {
    if (!transaction) return;

    const {
      Produto,
      Quantidade,
      "Preço unitário": price,
      "Entrada/Saída": type,
      Movimentação: category,
      Data: date,
      balance,
      profit,
    } = transaction;

    const totalValue = isNumeric(price) * parseFloat(Quantidade);

    return (
      <tr key={index}>
        <td>{date}</td>
        <td>{Produto}</td>
        <td>{category}</td>
        <td>{Quantidade}</td>
        <td>{price}</td>
        <td>{totalValue.toFixed(2)}</td>
        <td style={{ backgroundColor: type === "Credito" ? "green" : "red" }}>
          {type}
        </td>
        <td>{balance}</td>
        <td>{profit?.toFixed(2)}</td>
      </tr>
    );
  });

  return (
    <div>
      <div>
        <div>
          <label>Ano</label>
          <input
            type="number"
            value={yearFilter}
            onChange={handleYearChange}
            placeholder="YYYY"
          />
          <label>Mês</label>
          <input
            type="number"
            value={monthFilter}
            onChange={handleMonthChange}
            placeholder="MM"
          />
          <label>Produto</label>
          <input
            type="text"
            value={productFilter}
            onChange={handleProductChange}
            placeholder="Produto"
          />
        </div>
        <label>CPF</label>
        <input
          type="text"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
        <button onClick={fetchData}> Carregar Dados </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Produto</th>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Preço Unitário</th>
            <th>Total</th>
            <th>Entrada/Saída</th>
            <th>Saldo</th>
            <th>Lucro</th>
          </tr>
        </thead>
        <tbody>{table}</tbody>
      </table>
    </div>
  );
};

export default Transactions;
