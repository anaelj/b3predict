import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  magicFormulaFiltersEVEBIT,
  magicFormulaFiltersROIC,
} from "./data/magic-formula-filters";
// import { volume } from "./data/filters";
// const API_URL = "http://localhost:5000/api";

function formatNumber(value) {
  try {
    return value.toLocaleString("pt-BR");
  } catch (error) {
    return value;
  }
}

async function fetchApiData(paramSelectedType) {
  const url = "https://scanner.tradingview.com/brazil/scan";

  const payloadROIC = {
    ...magicFormulaFiltersROIC,
    filter: magicFormulaFiltersROIC.filter.map((item) =>
      item.left === "type" ? { ...item, right: paramSelectedType } : item
    ),
  };
  // console.log("payloadROIC", payloadROIC);

  const responseROIC = await axios.post(
    `https://bestchoice-serverless.netlify.app/.netlify/functions/post`,
    // `http://localhost:8888/.netlify/functions/post`,
    payloadROIC,
    {
      headers: {
        "Content-Type": "application/json",
        "x-target-url": url,
      },
    }
  );

  const payloadEVEBIT = {
    ...magicFormulaFiltersEVEBIT,
    filter: magicFormulaFiltersEVEBIT.filter.map((item) =>
      item.left === "type" ? { ...item, right: paramSelectedType } : item
    ),
  };
  // console.log("payloadEVEBIT", payloadEVEBIT);

  const responseEVEBIT = await axios.post(
    `https://bestchoice-serverless.netlify.app/.netlify/functions/post`,
    // `http://localhost:8888/.netlify/functions/post`,
    payloadEVEBIT,
    {
      headers: {
        "Content-Type": "application/json",
        "x-target-url": url,
      },
    }
  );

  const indexA = responseEVEBIT.data.data.reduce((acc, item, idx) => {
    acc[item.s] = { posA: idx };
    return acc;
  }, {});

  responseROIC.data.data.reduce((acc, item, idx) => {
    if (indexA[item.s]) {
      indexA[item.s].posB = idx;
    } else {
      indexA[item.s] = { posB: idx };
    }
    return acc;
  }, {});

  // Criar uma lista de todos os itens, mesclando os dados de ambos os arrays
  const allItems = [
    ...responseEVEBIT.data.data,
    ...responseROIC.data.data,
  ].reduce((acc, item) => {
    if (!acc.find((i) => i.s === item.s)) {
      acc.push(item);
    }
    return acc;
  }, []);

  // Calcular a pontuação e ordenar os itens
  const datasorted = allItems.sort((a, b) => {
    const posA = indexA[a.s] || {};
    const posB = indexA[b.s] || {};
    const scoreA = (posA.posA || Infinity) + (posA.posB || Infinity);
    const scoreB = (posB.posA || Infinity) + (posB.posB || Infinity);
    return scoreA - scoreB;
  });

  console.log(datasorted);
  // console.log(responseROIC);

  // console.log(response.data);

  if (datasorted)
    return {
      data: datasorted.filter(
        (item) => !item.d[0].includes("3F") && !item.d[0].includes("4F") && item
      ),
    };
}

function MagicFormula() {
  const [selectedType, setSelectedType] = useState("stock");
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  // const [filters, setFilters] = useState(volume);

  useEffect(() => {
    async function getData(paramSelectedType) {
      const apiData = await fetchApiData(paramSelectedType);
      const total = apiData.totalCount || 0;
      const data = apiData.data || [];

      // Processa os dados para a tela
      const processedData = data.map((item) => {
        const safeRound = (value) => {
          try {
            return Math.round(value);
          } catch (error) {
            return value;
          }
        };

        return {
          name: item.d[0],
          description: item.d[1],
          recommendation_mark: item.d[23],
          volume_change: safeRound(item.d[24]),
          volume: item.d[25],
          average_volume_30d_calc: safeRound(item.d[26]),
          average_volume_10d_calc: safeRound(item.d[27]),
          net_margin_fy: safeRound(item.d[28]),
          dividends_yield_current: safeRound(item.d[19]),
          fund_performance_yeld: safeRound(item.d[36]),
          return_on_invested_capital_fq: safeRound(item.d[37]),
          enterprise_value_to_ebit_ttm: safeRound(item.d[38]),
        };
      });

      setTotalCount(total);
      setData(processedData);
    }

    getData(selectedType);
  }, [selectedType]);

  return (
    <div>
      <h1>Dados de Mercado</h1>
      <div>
        <label>Tipo:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="stock">Ação</option>
          <option value="dr">BDR</option>
          {/* Adicione outras opções conforme necessário */}
        </select>
      </div>
      <p>Total de Resultados: {totalCount}</p>
      <table>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Marca de Recomendação</th>
            <th>Margem Líquida FY</th>
            <th>Dividendo Atual</th>
            <th>ROIC</th>
            <th>EV/EBIT</th>
            {/* <th>Rendimento do Fundo</th> */}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index}</td>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.recommendation_mark}</td>
              <td>{formatNumber(item.net_margin_fy)}</td>
              <td>{formatNumber(item.dividends_yield_current)}</td>
              <td>{formatNumber(item.return_on_invested_capital_fq)}</td>
              <td>{formatNumber(item.enterprise_value_to_ebit_ttm)}</td>
              {/* <td>{formatNumber(item.fund_performance_yeld)}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MagicFormula;
