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
  const [productFilter, setProductFilter] = useState("BLAU");
  const [selectedSell, setSelectedSell] = useState("");

  const handleYearChange = (e) => setYearFilter(e.target.value);
  const handleMonthChange = (e) => setMonthFilter(e.target.value);
  const handleProductChange = (e) => setProductFilter(e.target.value);

  const filteredRows = transactions?.filter((transaction) => {
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

      let sortedData;
      const sortedDataLocal = localStorage.getItem(`transaction-${cpf}`);
      if (sortedDataLocal) {
        sortedData = JSON.parse(sortedDataLocal);
      } else {
        const querySnapshot = await getDocs(collection(db, cpf));
        const transactionsData = querySnapshot.docs.map((doc) => doc.data());

        sortedData = transactionsData.sort(
          (a, b) => parseDate(a["Data"]) - parseDate(b["Data"])
        );

        localStorage.setItem(`transaction-${cpf}`, JSON.stringify(sortedData));
      }

      console.log(sortedData);

      setTransactions(
        sortedData.filter(
          (item) => item["Movimentação"] === "Transferência - Liquidação"
        )
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

  function updateTransaction(updatedObject) {
    const array = [...transactions];
    const index = array.findIndex((item) => item.ID === updatedObject.ID);

    if (index !== -1) {
      array[index] = updatedObject;
    }

    setTransactions(array);
  }

  useEffect(() => {
    console.log(transactions);
  }, [transactions]);

  const handleAddChild = (father, child) => {
    const currentBalance = father?.balance || father.Quantidade;

    if (father?.balance == 0) {
      alert("Não existe saldo para esta operação");
      return;
    }

    const oldChildBalance = child?.balance;

    let newChildBalance = child?.balance || child.Quantidade;
    newChildBalance =
      currentBalance > newChildBalance ? 0 : newChildBalance - currentBalance;
    child["balance"] = newChildBalance;
    updateTransaction(child);

    setTransactions((prevRows) =>
      prevRows.map((row) => {
        if (row.ID === father.ID) {
          let childID = `${row.ID}`;

          const quantity =
            child.Quantidade > currentBalance
              ? currentBalance
              : oldChildBalance || child.Quantidade;

          const newChild = {
            ...child,
            ID: childID,
            Quantidade: quantity,
            "Valor da Operação": quantity * child["Preço unitário"],
          };

          // const totalChild = quantity * row["Preço unitário"];

          const updatedChildren = row?.children
            ? [...row?.children, { ...newChild }]
            : [{ ...newChild }];
          const { totalSum, quantitySum } = updatedChildren.reduce(
            (totals, child) => {
              return {
                totalSum: totals.totalSum + (child["Valor da Operação"] || 0),
                quantitySum: totals.quantitySum + (child?.Quantidade || 0),
              };
            },
            { totalSum: 0, quantitySum: 0 }
          );

          father.balance = row.Quantidade - quantitySum;
          father.total = row["Valor da Operação"] - totalSum;

          console.log("totalSum", totalSum);

          return {
            ...row,
            children: updatedChildren,
            balance: row.Quantidade - quantitySum,
            profit: row["Valor da Operação"] - totalSum,
          };
        }
        return row;
      })
    );
  };

  const handleSelectSellTransaction = (transaction) => {
    setSelectedSell(transaction);
    setProductFilter(transaction.Produto.substring(0, 5));
  };

  const table = filteredRows?.map((transaction, index) => {
    if (!transaction) return;

    const {
      Produto,
      Quantidade,
      "Preço unitário": price,
      "Entrada/Saída": type,
      "Valor da Operação": total,
      Movimentação: category,
      Data: date,
      balance,
      profit,
      ID,
      children,
    } = transaction;

    return (
      <>
        <tr key={index}>
          <td>{date}</td>
          <td>{Produto}</td>
          <td>{category}</td>
          <td>{Quantidade}</td>
          <td>{price}</td>
          <td>{parseFloat(total).toFixed(2)}</td>
          <td style={{ backgroundColor: type === "Credito" ? "green" : "red" }}>
            {type}
          </td>
          <td>{balance}</td>
          <td>{profit?.toFixed(2)}</td>
          <td>
            {/* Dropdown para adicionar child */}
            <button
              disabled={transaction?.balance == 0}
              style={{
                backgroundColor:
                  transaction.ID === selectedSell.ID ? "orange" : "gray",
              }}
              onClick={() =>
                type === "Credito"
                  ? handleAddChild(selectedSell, transaction)
                  : handleSelectSellTransaction(transaction)
              }
            >
              Selecionar
            </button>
          </td>
        </tr>
        {children &&
          children.length > 0 &&
          children.map((child) => (
            <tr key={`${child.ID}}`}>
              <td colSpan="3"></td>
              <td>{child.Data}</td>
              <td>{child.Quantidade}</td>
              <td>{child["Preço unitário"]}</td>
              <td>{child["Valor da Operação"]}</td>
              <td colSpan="4"></td>
            </tr>
          ))}
      </>
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
