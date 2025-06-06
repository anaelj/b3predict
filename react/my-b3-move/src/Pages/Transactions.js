import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./../firebase";
import { fetchAndUpdateDocumentByID } from "../utils/firebase";

const Transactions = () => {
  const [transactions, setTransactions] = useState();
  const [cpf, setCpf] = useState(localStorage.getItem("best-choice-cpf"));

  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [selectedSell, setSelectedSell] = useState("");

  const handleYearChange = (e) => setYearFilter(e.target.value);
  const handleMonthChange = (e) => setMonthFilter(e.target.value);
  const handleProductChange = (e) => setProductFilter(e.target.value);

  const filteredRows = transactions
    ?.filter((item) => item["Movimentacao"] === "Transferência - Liquidação")
    ?.filter((transaction) => {
      if (!transaction) return false;

      const { Data: date, Produto } = transaction;
      const [, transactionMonth, transactionYear] = date.split("/");

      const yearMatch = yearFilter
        ? parseInt(transactionYear) === parseInt(yearFilter)
        : true;
      const monthMatch = monthFilter
        ? parseInt(transactionMonth) === parseInt(monthFilter)
        : true;
      const productMatch = productFilter
        ? Produto.includes(productFilter)
        : true;

      return yearMatch && monthMatch && productMatch;
    });

  const parseDate = (str) => {
    if (!str || str.length !== 10) return "";

    const [day, month, year] = str.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  const fetchData = async () => {
    try {
      if (!cpf) return;

      localStorage.setItem("best-choice-cpf", cpf);

      let sortedData;
      const sortedDataLocal = localStorage.getItem(`transaction-${cpf}`);
      if (sortedDataLocal) {
        sortedData = JSON.parse(sortedDataLocal);
      } else {
        const querySnapshot = await getDocs(collection(db, cpf));
        const transactionsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            Data: data.Data || data.Data_do_Negocio || null, // Prioriza Data, depois Data_do_Negocio
          };
        });

        sortedData = transactionsData.sort(
          (a, b) => parseDate(a["Data"]) - parseDate(b["Data"])
        );

        localStorage.setItem(`transaction-${cpf}`, JSON.stringify(sortedData));
      }

      // console.log(sortedData);

      setTransactions(sortedData);
    } catch (error) {
      console.error("Erro ao buscar dados: ", error);
    }
  };

  function updateTransaction(updatedObject) {
    const array = [...transactions];
    const index = array.findIndex((item) => item.ID === updatedObject.ID);

    if (index !== -1) {
      array[index] = updatedObject;
    }

    setTransactions(array);
    localStorage.setItem(`transaction-${cpf}`, JSON.stringify(array));
  }

  const clearChild = (data) => {
    data.children = [];
    data["balance"] = data.Quantidade;
    data["profit"] = 0;
    fetchAndUpdateDocumentByID({ collectionName: cpf, data });
    updateTransaction(data);
  };

  const { profitSum, interestEquitySum, dividendSum, sellSum, incomeSum } =
    transactions?.length > 0
      ? transactions
          ?.filter((item) => item.Data.includes(yearFilter))
          ?.filter((item) =>
            monthFilter > 0
              ? item.Data.split("/")[1].includes(monthFilter)
              : item
          )
          ?.reduce(
            (accumulator, currentValue) => {
              const profitSum = currentValue?.profit || 0;
              const interestEquitySum = currentValue?.Movimentacao.includes(
                "Juros"
              )
                ? currentValue?.Valor_da_Operacao || 0
                : 0;
              const dividendSum = currentValue?.Movimentacao.includes(
                "Dividendo"
              )
                ? currentValue?.Valor_da_Operacao || 0
                : 0;

              const incomeSum = currentValue?.Movimentacao.includes(
                "Rendimento"
              )
                ? currentValue?.Valor_da_Operacao || 0
                : 0;

              const sellSum =
                currentValue?.Movimentacao.includes("Transfer") &&
                currentValue?.Entrada_Saida.includes("Debito")
                  ? currentValue?.Valor_da_Operacao || 0
                  : 0;

              accumulator.profitSum += profitSum;
              accumulator.sellSum += sellSum;
              accumulator.dividendSum += dividendSum;
              accumulator.incomeSum += incomeSum;
              accumulator.interestEquitySum += interestEquitySum;

              return accumulator;
            },
            {
              profitSum: 0,
              interestEquitySum: 0,
              dividendSum: 0,
              sellSum: 0,
              incomeSum: 0,
            }
          )
      : {
          profitSum: 0,
          interestEquitySum: 0,
          dividendSum: 0,
          incomeSum: 0,
          sellSum: 0,
        };

  const handleAddChild = (father, child) => {
    const currentBalance = father?.balance || father.Quantidade;

    if (father?.balance === 0) {
      alert("Não existe saldo para esta operação");
      return;
    }

    if (father?.Produto.substring(0, 5) !== child.Produto.substring(0, 5)) {
      alert("Selecione o mesmo ativo!");
      return;
    }

    const oldChildBalance = child?.balance;

    let newChildBalance = child?.balance || child.Quantidade;
    newChildBalance =
      currentBalance > newChildBalance ? 0 : newChildBalance - currentBalance;
    child["balance"] = newChildBalance;
    updateTransaction(child);
    fetchAndUpdateDocumentByID({ collectionName: cpf, data: child });

    const quantity =
      child.Quantidade > currentBalance
        ? currentBalance
        : oldChildBalance || child.Quantidade;

    const newChild = {
      ...child,
      ID: child.ID,
      Quantidade: quantity,
      Valor_da_Operacao: quantity * child["Preco_unitario"],
    };

    const updatedChildren = father?.children
      ? [...father?.children, { ...newChild }]
      : [{ ...newChild }];
    const { totalSum, quantitySum } = updatedChildren.reduce(
      (totals, child) => {
        return {
          totalSum: totals.totalSum + (child["Valor_da_Operacao"] || 0),
          quantitySum: totals.quantitySum + (child?.Quantidade || 0),
        };
      },
      { totalSum: 0, quantitySum: 0 }
    );

    father.balance = father.Quantidade - quantitySum;
    father.total = father["Valor_da_Operacao"] - totalSum;
    father.children = updatedChildren;
    father.balance = father.Quantidade - quantitySum;
    father.profit = father["Valor_da_Operacao"] - totalSum;

    updateTransaction(father);
    fetchAndUpdateDocumentByID({ collectionName: cpf, data: father });
  };

  const handleSelectSellTransaction = (transaction) => {
    setSelectedSell(transaction);
    setProductFilter(transaction.Produto.substring(0, 5));
  };

  const table = filteredRows?.map((transaction, index) => {
    if (!transaction) return [];

    const {
      Produto,
      Quantidade,
      Preco_unitario: price,
      Entrada_Saida: type,
      Valor_da_Operacao: total,
      Movimentacao: category,
      Data: date,
      balance,
      profit,

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
            <button
              disabled={transaction?.balance === 0}
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
            <button
              style={{
                backgroundColor:
                  transaction.ID === selectedSell.ID ? "orange" : "gray",
              }}
              onClick={() => clearChild(transaction)}
            >
              Clear
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
              <td>{child.Preco_unitario}</td>
              <td>{child.Valor_da_Operacao}</td>
              <td colSpan="4"></td>
            </tr>
          ))}
      </>
    );
  });

  return (
    <div>
      <div>
        <h2>Soma Operações: {Number(profitSum || 0).toFixed(2)}</h2>
        <h2>
          Juros Sobre Capital Próprio:{" "}
          {Number(interestEquitySum || 0).toFixed(2)}
        </h2>
        <h2>Dividendo: {Number(dividendSum || 0).toFixed(2)}</h2>
        <h2>Rendimento: {Number(incomeSum || 0).toFixed(2)}</h2>
        <h2>
          Total:{" "}
          {Number(
            dividendSum + profitSum + interestEquitySum + incomeSum
          ).toFixed(2)}
        </h2>
        <h2>Vendas: {Number(parseFloat(sellSum || 0)).toFixed(2)}</h2>
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
            <th>Preco_unitario</th>
            <th>Total</th>
            <th>Entrada_Saida</th>
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
